import { safeNextPath } from "@/lib/auth/redirect"

describe("auth return paths", () => {
  it.each([
    null,
    "https://example.org",
    "//example.org",
    "/\\example.org",
    "/\t/example.org"
  ])("blocks external return path %s", path => {
    expect(safeNextPath(path)).toBe("/")
  })
  it("preserves the password recovery path", () => {
    expect(safeNextPath("/login/password")).toBe("/login/password")
  })
})
