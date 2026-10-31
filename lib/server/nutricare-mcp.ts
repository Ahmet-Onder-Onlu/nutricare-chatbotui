import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const entitySchema = z
  .object({
    foods: z.array(z.string().trim().min(2).max(100)).max(8),
    drugs: z.array(z.string().trim().min(2).max(100)).max(8)
  })
  .strict()
export type ClinicalEntities = z.infer<typeof entitySchema>
type Client = ReturnType<typeof createClient>

export const clinicalTool = {
  name: "search_clinical_records",
  description:
    "Find all matching food/drug records, including interaction mechanisms, management and original sources. Read-only; caller session RLS applies.",
  inputSchema: {
    type: "object",
    properties: {
      foods: { type: "array", items: { type: "string" }, maxItems: 8 },
      drugs: { type: "array", items: { type: "string" }, maxItems: 8 }
    },
    required: ["foods", "drugs"],
    additionalProperties: false
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false
  }
}

function safeTerms(terms: string[]) {
  return [
    ...new Set(
      terms
        .map(term =>
          term
            .toLocaleLowerCase("tr-TR")
            .replace(/[^\p{L}\p{N} ]/gu, " ")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(term => term.length >= 2)
    )
  ]
}

async function allRows(
  client: Client,
  table: "nutricare" | "food_interactions",
  filters: string[]
) {
  if (!filters.length) return []
  const rows: Record<string, unknown>[] = []
  for (let offset = 0; offset < 2000; offset += 200) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .or(filters.join(","))
      .order("id")
      .range(offset, offset + 199)
    if (error)
      throw new Error(
        "NutriCare kaynaklarına erişilemedi. Lütfen daha sonra tekrar deneyin."
      )
    rows.push(...(data || []))
    if ((data || []).length < 200) return rows
  }
  throw new Error(
    "NutriCare araması çok geniş. Lütfen belirli bir besin veya ilaç adıyla sorunuzu daraltın."
  )
}

export async function searchClinicalRecords(client: Client, input: unknown) {
  const entities = entitySchema.parse(input)
  const foods = safeTerms(entities.foods)
  const drugs = safeTerms(entities.drugs)
  const [foodRecords, drugRecords] = await Promise.all([
    allRows(client, "food_interactions", [
      ...foods.flatMap(term => [
        `food_name.ilike.%${term}%`,
        `latin_name.ilike.%${term}%`
      ]),
      ...drugs.map(term => `interacting_drugs.ilike.%${term}%`)
    ]),
    allRows(
      client,
      "nutricare",
      drugs.flatMap(term => [
        `drug.ilike.%${term}%`,
        `active_sub.ilike.%${term}%`
      ])
    )
  ])
  const records = { entities, foodRecords, drugRecords, complete: true }
  const text = JSON.stringify(records)
  // Never silently cut JSON or omit source rows from a supposedly complete answer.
  if (text.length > 120000)
    throw new Error(
      "NutriCare kaynakları tek yanıt için çok geniş. Lütfen tek bir besin veya ilaçla sorunuzu daraltın."
    )
  return { content: [{ type: "text" as const, text }], isError: false }
}

// Real MCP client/server over the SDK's in-memory transport: no public endpoint.
// Each request gets its own server bound to the caller's Supabase session.
export async function callClinicalTool(
  client: Client,
  entities: ClinicalEntities
): Promise<string> {
  const server = new Server(
    { name: "nutricare-clinical", version: "1.0.0" },
    { capabilities: { tools: {} } }
  )
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [clinicalTool]
  }))
  server.setRequestHandler(CallToolRequestSchema, async request => {
    if (request.params.name !== clinicalTool.name)
      throw new Error("NutriCare MCP aracı bulunamadı.")
    return searchClinicalRecords(client, request.params.arguments)
  })
  const mcp = new McpClient({ name: "nutricare-chat", version: "1.0.0" })
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair()
  try {
    await server.connect(serverTransport)
    await mcp.connect(clientTransport)
    await mcp.listTools()
    const response = await mcp.callTool({
      name: clinicalTool.name,
      arguments: entities
    })
    if (response.isError) throw new Error("NutriCare kaynaklarına erişilemedi.")
    const content = response.content as { type: string; text?: string }[]
    const text = content.find(part => part.type === "text")?.text
    if (!text) throw new Error("NutriCare kaynak sonucu alınamadı.")
    return text
  } catch (error) {
    if (error instanceof Error && error.message.includes("NutriCare"))
      throw error
    throw new Error(
      "NutriCare kaynaklarına erişilemedi. Lütfen tekrar deneyin."
    )
  } finally {
    await mcp.close()
    await server.close()
  }
}
