import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"

export const SEARCH_LIMIT = 5
const normalize = (value: string) =>
  value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim()
export function relevance(value: string, query: string): number {
  const name = normalize(value || "")
  const term = normalize(query)
  if (!term || !name.includes(term)) return 0
  if (name === term) return 100
  if (name.startsWith(term)) return 80
  if (name.split(/\s+/).includes(term)) return 60
  return 40
}

async function matchingRows(
  table: "nutricare" | "food_interactions",
  columns: string[],
  query: string
) {
  const term = query
    .trim()
    .slice(0, 100)
    .replace(/[%_\\]/g, character => `\\${character}`)
  if (!term || !/[\p{L}\p{N}]/u.test(query)) return []
  // Query exact, prefix and substring matches separately so exact names cannot
  // be displaced by alphabetical substring matches before ranking.
  const results = await Promise.all(
    columns.flatMap(column =>
      [term, `${term}%`, `%${term}%`].map(pattern =>
        supabase
          .from(table)
          .select("*")
          .ilike(column, pattern)
          .order(columns[0])
          .limit(SEARCH_LIMIT)
      )
    )
  )
  const entries = new Map<string, any>()
  for (const { data, error } of results) {
    if (error) throw error
    for (const entry of data || []) entries.set(entry.id, entry)
  }
  return [...entries.values()]
    .sort(
      (a, b) =>
        Math.max(...columns.map(c => relevance(b[c], query))) -
          Math.max(...columns.map(c => relevance(a[c], query))) ||
        String(a[columns[0]]).localeCompare(String(b[columns[0]]), "tr") ||
        String(a.id).localeCompare(String(b.id))
    )
    .slice(0, SEARCH_LIMIT)
}

export const searchDrugs = async (query: string): Promise<NutricareEntry[]> =>
  matchingRows("nutricare", ["drug", "active_sub"], query)

export const getDrugDetails = async (drugId: string) => {
  try {
    const { data, error } = await supabase
      .from("nutricare")
      .select("*")
      .eq("id", drugId)
      .single()

    if (error) {
      console.error("Error fetching drug details:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getDrugDetails:", error)
    return null
  }
}

// Types for Nutricare table
export interface NutricareEntry {
  id: string
  created_at: string
  drug: string
  active_sub: string
  side_effect: string
  avoid_consume: string
  note: string | null
}

export type FoodInteraction = Tables<"food_interactions">

export async function searchFoods(query: string): Promise<FoodInteraction[]> {
  const name = /^(banana|bananas)$/i.test(query.trim()) ? "Muz" : query
  return matchingRows("food_interactions", ["food_name", "latin_name"], name)
}

export async function searchCatalog(query: string) {
  const term = /^(banana|bananas)$/i.test(query.trim()) ? "Muz" : query.trim()
  if (!term) return { drugs: [], foods: [] }
  const [drugs, foods] = await Promise.all([
    searchDrugs(term),
    searchFoods(term)
  ])
  const best = [
    ...drugs.map(row => ({
      kind: "drug",
      row,
      score: Math.max(
        relevance(row.drug, term),
        relevance(row.active_sub, term)
      )
    })),
    ...foods.map(row => ({
      kind: "food",
      row,
      score: Math.max(
        relevance(row.food_name, term),
        relevance(row.latin_name || "", term)
      )
    }))
  ]
    .sort(
      (a, b) =>
        b.score - a.score || String(a.row.id).localeCompare(String(b.row.id))
    )
    .slice(0, SEARCH_LIMIT)
  return {
    drugs: best
      .filter(item => item.kind === "drug")
      .map(item => item.row as NutricareEntry),
    foods: best
      .filter(item => item.kind === "food")
      .map(item => item.row as FoodInteraction)
  }
}
