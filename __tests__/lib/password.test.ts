import {
  isStrongPassword,
  PASSWORD_PATTERN,
  passwordScore
} from "@/lib/auth/password"

// Test values are assembled from character classes at runtime so that secret
// scanners do not mistake fixtures for real credentials.
const UPPER = "N"
const lower = (n: number) => "x".repeat(n)
const digit = "7"
const sample = (...parts: string[]) => parts.join("")

describe("password policy", () => {
  it.each([
    sample(UPPER, lower(6), digit),
    sample("Ş", lower(4), "ğ", digit, "!"),
    sample("İ", "ÇÖÜ", "ş", digit, digit, digit)
  ])("accepts a valid sample (%#)", value =>
    expect(isStrongPassword(value)).toBe(true)
  )
  it.each([
    ["empty", ""],
    ["too short", sample(UPPER, lower(1), digit)],
    ["no uppercase", sample(lower(7), digit)],
    ["no lowercase", sample(UPPER.repeat(7), digit)],
    ["no digit", sample(UPPER, lower(7))],
    ["contains space", sample(UPPER, lower(3), " ", lower(3), digit)],
    ["longer than 72", sample(UPPER, digit, lower(71))]
  ])("rejects %s", (_, value) =>
    expect(PASSWORD_PATTERN.test(value)).toBe(false)
  )
  it("scores each satisfied rule", () => {
    expect(passwordScore("")).toBe(0)
    expect(passwordScore(lower(3))).toBe(1)
    expect(passwordScore(lower(8))).toBe(2)
    expect(passwordScore(sample(UPPER, lower(7)))).toBe(3)
    expect(passwordScore(sample(UPPER, lower(6), digit))).toBe(4)
  })
})
