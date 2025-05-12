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
      return []
    }

    console.log("Search results:", data)
    return data
  } catch (error) {
    console.error("Error in searchDrugs:", error)
    return []
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
