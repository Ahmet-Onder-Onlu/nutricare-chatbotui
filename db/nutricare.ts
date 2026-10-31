import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"

export const searchDrugs = async (query: string) => {
  try {
    console.log("Searching for:", query)

    // Doğrudan arama yapalım, count sorgusunu kaldıralım
    const { data, error } = await supabase
      .from("nutricare")
      .select("*")
      .ilike("drug", `%${query}%`)
      .order("drug", { ascending: true })
      .limit(5)

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    console.log("Search results:", data)
    return data
  } catch (error) {
    console.error("Error in searchDrugs:", error)
    throw error
  }
}

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
  const term = query.trim().replace(/[%_\\]/g, character => `\\${character}`)
  if (!term) return []
  const name = /^(banana|bananas)$/i.test(term) ? "Muz" : term
  // Separate filters avoid interpolating user input into PostgREST OR syntax.
  const results = await Promise.all(
    ["food_name", "latin_name"].map(column =>
      supabase
        .from("food_interactions")
        .select("*")
        .ilike(column, `%${name}%`)
        .order("food_name")
        .limit(200)
    )
  )
  const entries = new Map<string, FoodInteraction>()
  for (const { data, error } of results) {
    if (error) throw error
    for (const entry of data || []) entries.set(entry.id, entry)
  }
  return [...entries.values()]
}
