import { searchFoods, searchCatalog, relevance } from "@/db/nutricare"
import { supabase } from "@/lib/supabase/browser-client"

jest.mock("@/lib/supabase/browser-client", () => ({
  supabase: { from: jest.fn() }
}))

describe("food dataset search", () => {
  let ilike: jest.Mock
  let limit: jest.Mock
  beforeEach(() => {
    limit = jest.fn().mockResolvedValue({
      data: [{ id: "row1", food_name: "Ananas" }],
      error: null
    })
    ilike = jest.fn().mockReturnValue({ order: () => ({ limit }) })
    ;(supabase.from as jest.Mock).mockReturnValue({ select: () => ({ ilike }) })
  })
  it("searches names and Latin names and deduplicates matching rows", async () => {
    expect(await searchFoods("Ananas")).toHaveLength(1)
    expect(ilike).toHaveBeenCalledWith("food_name", "%Ananas%")
    expect(ilike).toHaveBeenCalledWith("latin_name", "%Ananas%")
  })
  it("supports banana as a Muz alias without creating results", async () => {
    limit.mockResolvedValue({ data: [], error: null })
    expect(await searchFoods("banana")).toEqual([])
    expect(ilike).toHaveBeenCalledWith("food_name", "%Muz%")
  })
  it("reports database errors instead of returning a false no-match", async () => {
    limit.mockResolvedValue({ data: null, error: new Error("unavailable") })
    await expect(searchFoods("Ananas")).rejects.toThrow("unavailable")
  })
})

it("ranks exact names above prefixes and incidental substring matches", () => {
  expect(relevance("Ananas", "ananas")).toBeGreaterThan(
    relevance("Ananas suyu", "ananas")
  )
  expect(relevance("Ananas suyu", "ananas")).toBeGreaterThan(
    relevance("Kurutulmuş ananas", "ananas")
  )
})

it("caps the combined food and drug results at five and keeps an exact match", async () => {
  const rows = (prefix: string, field: string) =>
    Array.from({ length: 7 }, (_, i) => ({
      id: prefix + i,
      [field]: i === 6 ? "Ananas" : "Ananas " + i
    }))
  const limit = jest.fn()
  ;(supabase.from as jest.Mock).mockImplementation(table => ({
    select: () => ({
      ilike: () => ({
        order: () => ({
          limit: (n: number) => {
            limit(n)
            return Promise.resolve({
              data: rows(table, table === "nutricare" ? "drug" : "food_name"),
              error: null
            })
          }
        })
      })
    })
  }))
  const result = await searchCatalog("ananas")
  expect(result.drugs.length + result.foods.length).toBe(5)
  expect([
    ...result.drugs.map(r => r.drug),
    ...result.foods.map(r => r.food_name)
  ]).toContain("Ananas")
  expect(limit).toHaveBeenCalledWith(5)
})

it("does not query the database for empty searches", async () => {
  const from = supabase.from as jest.Mock
  from.mockClear()
  expect(await searchCatalog("  ")).toEqual({ drugs: [], foods: [] })
  expect(from).not.toHaveBeenCalled()
})
