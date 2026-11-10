"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { FoodInteraction } from "@/lib/interactions/risk"
import { useCallback, useEffect, useState } from "react"

let cache: FoodInteraction[] | null = null

/** Tüm etkileşim kayıtlarını (küçük, ~160 satır) bir kez okur ve önbellekler. */
export function useInteractions() {
  const [rows, setRows] = useState<FoodInteraction[]>(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    const collected: FoodInteraction[] = []
    try {
      for (let offset = 0; offset < 5000; offset += 1000) {
        const { data, error } = await supabase
          .from("food_interactions")
          .select("*")
          .order("food_name")
          .order("id")
          .range(offset, offset + 999)
        if (error) throw error
        collected.push(...(data || []))
        if ((data || []).length < 1000) break
      }
      cache = collected
      setRows(collected)
    } catch {
      setError(
        "Etkileşim kayıtları yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!cache) load()
  }, [load])

  return { rows, loading, error, reload: load }
}
