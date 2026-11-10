import {
  EMPTY_PROFILE,
  parseProfile,
  personalMatches,
  PROFILE_CONTEXT_LIMIT,
  profilePromptSummary,
  sanitizeProfile,
  serializeProfile
} from "@/lib/health-profile"

const base = {
  ...EMPTY_PROFILE,
  sex: "kadin" as const,
  age: 54,
  heightCm: 165,
  weightKg: 70,
  medications: ["Varfarin"],
  updatedAt: "2026-11-10T00:00:00.000Z"
}

describe("health profile", () => {
  it("round-trips through profile_context", () => {
    const text = serializeProfile(base)
    expect(parseProfile(text)).toEqual(sanitizeProfile(base))
  })
  it("ignores unrelated or malformed profile_context", () => {
    expect(parseProfile("I like short answers")).toBeNull()
    expect(parseProfile("[NutriCare sağlık profili v1]\n{oops")).toBeNull()
  })
  it("never exceeds the 1500 character database limit", () => {
    const huge = {
      ...base,
      notes: "x".repeat(500),
      medications: Array.from(
        { length: 30 },
        (_, i) => `İlaç ${i} ${"y".repeat(50)}`
      ),
      conditions: Array.from(
        { length: 30 },
        (_, i) => `Hastalık ${i} ${"z".repeat(50)}`
      ),
      allergies: Array.from(
        { length: 30 },
        (_, i) => `Alerji ${i} ${"w".repeat(50)}`
      ),
      supplements: Array.from(
        { length: 30 },
        (_, i) => `Takviye ${i} ${"v".repeat(50)}`
      )
    }
    expect(serializeProfile(huge).length).toBeLessThanOrEqual(
      PROFILE_CONTEXT_LIMIT
    )
  })
  it("clamps invalid values", () => {
    const clean = sanitizeProfile({
      age: 999,
      sex: "x" as any,
      pregnancy: true
    } as any)
    expect(clean.age).toBeNull()
    expect(clean.sex).toBe("")
    expect(clean.pregnancy).toBe(false)
  })
  it("matches medications to interaction rows via drug classes", () => {
    const rows = [
      {
        id: "a",
        interacting_drugs: "Kan sulandırıcı ilaçlar (Antikoagülan)",
        mechanism: ""
      },
      { id: "b", interacting_drugs: "Statinler", mechanism: "" }
    ] as any
    expect(personalMatches(rows, sanitizeProfile(base)).map(r => r.id)).toEqual(
      ["a"]
    )
  })
  it("summarises the profile for the assistant", () => {
    const summary = profilePromptSummary(sanitizeProfile(base))
    expect(summary).toContain("Yaş: 54")
    expect(summary).toContain("Varfarin")
  })
})
