/** @jest-environment node */
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { createServerClient } from "@supabase/ssr"

jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn() }))
jest.mock("next/headers", () => ({ cookies: () => ({ get: jest.fn() }) }))

describe("server provider credentials", () => {
  const original = process.env.OPENAI_API_KEY
  beforeEach(() => {
    const query: any = {
      single: jest
        .fn()
        .mockResolvedValue({
          data: { user_id: "user1", openai_api_key: "  profile-key\n" }
        })
    }
    query.select = query.eq = jest.fn(() => query)
    ;(createServerClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user1" } } })
      },
      from: jest.fn(() => query)
    })
  })
  afterAll(() => {
    if (original === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = original
  })
  it("removes accidental whitespace from environment credentials", async () => {
    process.env.OPENAI_API_KEY = "  environment-key\n"
    expect((await getServerProfile()).openai_api_key).toBe("environment-key")
  })
  it("does not let a whitespace-only environment value replace a personal key", async () => {
    process.env.OPENAI_API_KEY = " \n"
    expect((await getServerProfile()).openai_api_key).toBe("profile-key")
  })
})
