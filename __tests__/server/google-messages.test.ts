import { prepareGoogleMessages } from "@/lib/server/google-messages"

describe("Gemini message preparation", () => {
  it("moves system instructions out of conversational turns and preserves images", () => {
    const image = { inlineData: { data: "image", mimeType: "image/png" } }
    const result = prepareGoogleMessages([
      { role: "system", parts: [{ text: "Clinical context" }] },
      { role: "user", parts: [{ text: "First question" }] },
      { role: "model", parts: [{ text: "First answer" }] },
      { role: "user", parts: [{ text: "Follow-up" }, image] }
    ])
    expect(result.system).toBe("Clinical context")
    expect(result.contents.map(message => message.role)).toEqual([
      "user",
      "model",
      "user"
    ])
    expect(result.contents[2].parts).toContain(image)
    expect(result.userText).toContain("Follow-up")
  })
  it("merges adjacent user messages without mutating the request", () => {
    const first = { role: "user", parts: [{ text: "A" }] }
    const result = prepareGoogleMessages([
      first,
      { role: "user", parts: [{ text: "B" }] }
    ])
    expect(result.contents).toHaveLength(1)
    expect(result.userText).toBe("A B")
    expect(first.parts).toHaveLength(1)
  })
  it.each([
    { messages: [] },
    { messages: [{ role: "model", parts: [{ text: "A" }] }] },
    { messages: [{ role: "user", content: "Missing parts" }] }
  ])("rejects malformed conversations", ({ messages }) => {
    expect(() => prepareGoogleMessages(messages)).toThrow()
  })
})
