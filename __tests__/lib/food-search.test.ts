import { searchFoods } from "@/db/nutricare"
import { supabase } from "@/lib/supabase/browser-client"

jest.mock("@/lib/supabase/browser-client", () => ({
  supabase: { from: jest.fn() }
}))

describe("food dataset search", () => {
  let ilike: jest.Mock
  let limit: jest.Mock
  beforeEach(() => {
    limit = jest
      .fn()
      .mockResolvedValue({
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
