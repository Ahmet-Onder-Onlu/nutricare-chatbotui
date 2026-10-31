/** @jest-environment node */
import {
  drugSearchTerms,
  getNutricareContext
} from "@/lib/server/nutricare-context"
import { createClient } from "@/lib/supabase/server"

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }))
jest.mock("next/headers", () => ({ cookies: jest.fn() }))

describe("NutriCare source retrieval", () => {
  function database(result: object) {
    const query: any = {}
    for (const method of ["select", "or", "order"])
      query[method] = jest.fn(() => query)
    query.range = jest.fn().mockResolvedValue(result)
    const client = { from: jest.fn(() => query) }
    ;(createClient as jest.Mock).mockReturnValue(client)
    return { client, query }
  }
  beforeEach(() => jest.clearAllMocks())
  it("searches drug and active substance and includes record identities", async () => {
    const { query, client } = database({
      data: [
        { id: "source-1", drug: "Aspirin", active_sub: "Asetilsalisilik asit" }
      ],
      error: null
    })
    const context = await getNutricareContext(
      "Aspirin ile besin etkileşimi nedir?"
    )
    expect(client.from).toHaveBeenCalledWith("nutricare")
    expect(query.or).toHaveBeenCalledWith(
      expect.stringContaining("drug.ilike.%aspirin%,active_sub.ilike.%aspirin%")
    )
    expect(context).toContain("source-1")
    expect(query.range).toHaveBeenCalledWith(0, 199)
  })
  it("uses extracted food names to query all structured source fields", async () => {
    const { client, query } = database({
      data: [
        {
          id: "food-1",
          food_name: "Ananas",
          management: "Kaynak yönetimi",
          sources: "Original reference"
        }
      ],
      error: null
    })
    const context = await getNutricareContext(
      "Pineapple kullanabilir miyim?",
      async () => JSON.stringify({ foods: ["ananas"], drugs: [] })
    )
    expect(client.from).toHaveBeenCalledWith("food_interactions")
    expect(query.select).toHaveBeenCalledWith("*")
    expect(query.or).toHaveBeenCalledWith(
      "food_name.ilike.%ananas%,latin_name.ilike.%ananas%"
    )
    expect(context).toContain("Original reference")
  })
  it("falls back explicitly when extraction returns invalid JSON", async () => {
    database({ data: [], error: null })
    expect(
      await getNutricareContext("Ananas", async () => "invalid")
    ).toContain("yedek arama")
  })
  it("reports no match without fabricating a source", async () => {
    database({ data: [], error: null })
    expect(await getNutricareContext("bilinmeyenilaç")).toContain(
      "eşleşen kayıt bulunamadı"
    )
  })
  it("fails explicitly on database errors", async () => {
    database({ data: null, error: { code: "42P01" } })
    const log = jest.spyOn(console, "error").mockImplementation(() => {})
    await expect(getNutricareContext("Aspirin")).rejects.toThrow(
      "kaynaklarına erişilemedi"
    )
    log.mockRestore()
  })
  it("does not query the entire table for empty search input", async () => {
    expect(await getNutricareContext("?!")).toContain(
      "besin veya ilaç adı belirlenemedi"
    )
    expect(createClient).not.toHaveBeenCalled()
  })
  it("excludes filter syntax from all tokens and bounds search size", () => {
    const terms = drugSearchTerms(
      "ASPİRİN,drug.eq.secret) %_ (metformin) " + "test ".repeat(30)
    )
    expect(terms).toContain("aspirin")
    expect(terms.length).toBeLessThanOrEqual(16)
    expect(terms.every(term => /^[\p{L}\p{N}]+$/u.test(term))).toBe(true)
  })
})
