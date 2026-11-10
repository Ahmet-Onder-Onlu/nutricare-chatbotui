import {
  classifyRisk,
  cleanField,
  interactionTitle,
  riskCounts
} from "@/lib/interactions/risk"

const row = (overrides: Record<string, string> = {}) =>
  ({
    id: "1",
    food_name: "Greyfurt",
    latin_name: "",
    active_ingredient: "",
    pharmacological_effect: "",
    interacting_drugs: "",
    mechanism: "",
    onset: "",
    risk_groups: "",
    management: "",
    sources: "",
    updated_at_source: "",
    ...overrides
  }) as any

describe("risk classification", () => {
  it("treats placeholders as empty", () => {
    expect(cleanField(" X ")).toBe("")
    expect(cleanField("YOK")).toBe("")
    expect(cleanField("yok")).toBe("")
    expect(cleanField("Statinler")).toBe("Statinler")
  })
  it("marks rows without interaction data as none (green)", () => {
    expect(
      classifyRisk(row({ management: "YOK", interacting_drugs: "" }))
    ).toBe("none")
  })
  it("marks avoid/stop language as high (red)", () => {
    expect(
      classifyRisk(
        row({
          interacting_drugs: "Statinler",
          management: "Birlikte kullanımdan kaçınılmalıdır."
        })
      )
    ).toBe("high")
    expect(
      classifyRisk(
        row({
          interacting_drugs: "Lityum",
          management: "Bu kombinasyonu almayın"
        })
      )
    ).toBe("high")
  })
  it("marks caution language as moderate (yellow)", () => {
    expect(
      classifyRisk(
        row({
          interacting_drugs: "Antikoagülanlar",
          management: "Bu kombinasyona karşı dikkatli olun"
        })
      )
    ).toBe("moderate")
  })
  it("builds readable titles and counts", () => {
    const rows = [
      row({ interacting_drugs: "Statinler\\nDiğer", management: "Kaçının" }),
      row({ id: "2", interacting_drugs: "Varfarin", management: "Dikkat" }),
      row({ id: "3" })
    ]
    expect(interactionTitle(rows[1])).toBe("Greyfurt × Varfarin")
    expect(riskCounts(rows)).toEqual({ high: 1, moderate: 1, none: 1 })
  })
})
