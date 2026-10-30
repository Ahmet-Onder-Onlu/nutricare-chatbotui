/** @jest-environment node */
import { POST } from "@/app/api/chat/google/route"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { getNutricareContext } from "@/lib/server/nutricare-context"

jest.mock("@google/generative-ai", () => ({ GoogleGenerativeAI: jest.fn() }))
jest.mock("@/lib/server/server-chat-helpers", () => ({
  getServerProfile: jest.fn(),
  checkApiKey: jest.fn()
}))
jest.mock("@/lib/server/nutricare-context", () => ({
  getNutricareContext: jest.fn(),
  NUTRICARE_SYSTEM_PROMPT: "Clinical policy"
}))

function request() {
  return new Request("https://nutricare.test/api/chat/google", {
    method: "POST",
    body: JSON.stringify({
      chatSettings: { model: "gemini-3.5-flash-lite", temperature: 0.3 },
      messages: [
        { role: "system", parts: [{ text: "Personal context" }] },
        { role: "user", parts: [{ text: "Aspirin" }] }
      ]
    })
  })
}

describe("Gemini clinical chat", () => {
  let generate: jest.Mock, getModel: jest.Mock
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerProfile as jest.Mock).mockResolvedValue({
      google_gemini_api_key: "test-key"
    })
    ;(getNutricareContext as jest.Mock).mockResolvedValue(
      "Database record source-1"
    )
    generate = jest.fn().mockResolvedValue({
      stream: (async function* () {
        yield {
          candidates: [
            {
              content: {
                parts: [{ text: "Internal", thought: true }, { text: "Yanıt" }]
              }
            }
          ]
        }
      })()
    })
    getModel = jest.fn(() => ({ generateContentStream: generate }))
    ;(GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: getModel
    }))
  })
  it("adds source context and clinical policy server-side and streams only response text", async () => {
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("Yanıt")
    expect(getNutricareContext).toHaveBeenCalledWith("Aspirin")
    expect(getModel).toHaveBeenCalledWith(
      expect.objectContaining({
        systemInstruction: expect.stringContaining("Database record source-1")
      })
    )
    expect(generate.mock.calls[0][0].contents[0].role).toBe("user")
  })
  it("returns provider auth errors without disclosing the key", async () => {
    generate.mockRejectedValue({
      status: 400,
      message: "API key not valid: SECRET"
    })
    const response = await POST(request())
    expect(response.status).toBe(400)
    const body = await response.text()
    expect(body).toContain("geçersiz")
    expect(body).not.toContain("SECRET")
  })
  it("does not generate an unsourced answer when database retrieval fails", async () => {
    ;(getNutricareContext as jest.Mock).mockRejectedValue(
      new Error("NutriCare kaynaklarına erişilemedi.")
    )
    const response = await POST(request())
    expect(response.status).toBe(500)
    expect(generate).not.toHaveBeenCalled()
  })
})
