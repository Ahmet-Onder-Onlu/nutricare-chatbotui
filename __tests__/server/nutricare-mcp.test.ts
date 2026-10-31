/** @jest-environment node */
import {
  callClinicalTool,
  searchClinicalRecords
} from "@/lib/server/nutricare-mcp"

describe("private clinical MCP tool", () => {
  const client = (pages: any[]) => {
    const range = jest.fn()
    pages.forEach(page =>
      range.mockResolvedValueOnce({ data: page, error: null })
    )
    const query: any = { range }
    for (const method of ["select", "or", "order"])
      query[method] = jest.fn(() => query)
    return { db: { from: jest.fn(() => query) } as any, query }
  }
  it("retrieves later pages and preserves every interaction row", async () => {
    const first = Array.from({ length: 200 }, (_, id) => ({ id }))
    const { db, query } = client([
      first,
      [{ id: 201, sources: "last reference" }]
    ])
    const result = JSON.parse(
      await callClinicalTool(db, { foods: ["ananas"], drugs: [] })
    )
    expect(result.foodRecords).toHaveLength(201)
    expect(result.foodRecords[200].sources).toBe("last reference")
    expect(result.complete).toBe(true)
    expect(query.range).toHaveBeenNthCalledWith(2, 200, 399)
    expect(db.from).not.toHaveBeenCalledWith("nutricare")
  })
  it("never turns unknown tools or invalid arguments into database calls", async () => {
    const { db } = client([])
    await expect(
      callClinicalTool(db, { foods: [], drugs: [], sql: "DELETE" } as any)
    ).rejects.toThrow()
    expect(db.from).not.toHaveBeenCalled()
  })
  it("does not query a full table for punctuation-only entities", async () => {
    const { db } = client([])
    const result = JSON.parse(
      await callClinicalTool(db, { foods: ["%_"], drugs: [] })
    )
    expect(result.foodRecords).toEqual([])
    expect(db.from).not.toHaveBeenCalled()
  })
})
