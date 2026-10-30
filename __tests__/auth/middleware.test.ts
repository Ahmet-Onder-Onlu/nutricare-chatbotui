/** @jest-environment node */
import { middleware } from "@/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextRequest } from "next/server"

jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn() }))

describe("locale and session middleware", () => {
  it("refreshes auth before rewriting and retains all cookie chunks", async () => {
    ;(createServerClient as jest.Mock).mockImplementation(
      (_url, _key, options) => ({
        auth: {
          getUser: async () => {
            options.cookies.set("sb-test-auth-token.0", "chunk-zero", {
              path: "/",
              httpOnly: true
            })
            options.cookies.set("sb-test-auth-token.1", "chunk-one", {
              path: "/",
              httpOnly: true
            })
            return { data: { user: { id: "user1" } }, error: null }
          }
        }
      })
    )
    const response = await middleware(
      new NextRequest("https://www.nutricaretek.com/login", {
        headers: { "accept-language": "en" }
      })
    )
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://www.nutricaretek.com/en/login"
    )
    expect(response.cookies.get("sb-test-auth-token.0")?.value).toBe(
      "chunk-zero"
    )
    expect(response.cookies.get("sb-test-auth-token.1")?.value).toBe(
      "chunk-one"
    )
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "sb-test-auth-token.1=chunk-one"
    )
  })
})
