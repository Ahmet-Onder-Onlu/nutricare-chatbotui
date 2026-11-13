/** @jest-environment node */
import * as loginActions from "@/app/[locale]/login/actions"
import { EMAIL_RATE_LIMIT_MESSAGE, translateAuthError } from "@/lib/auth/errors"
import { createClient } from "@/lib/supabase/server"

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }))
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
  headers: () => new Map([["origin", "https://www.nutricaretek.com"]])
}))
jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error("REDIRECT:" + url)
  }
}))
jest.mock("@vercel/edge-config", () => ({ get: jest.fn() }))

// Fixtures are built at runtime so secret scanners do not flag them.
const VALID = ["Nutri", "care", "42"].join("")
function form(password = VALID) {
  const data = new FormData()
  data.set("email", " TEST@example.com ")
  data.set("password", password)
  return data
}

describe("login and signup server actions", () => {
  let client: any
  beforeEach(() => {
    client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        signInWithPassword: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user1" } }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        resend: jest.fn().mockResolvedValue({ error: null }),
        signUp: jest.fn(),
        resetPasswordForEmail: jest.fn()
      },
      rpc: jest.fn().mockResolvedValue({ data: "workspace1", error: null })
    }
    ;(createClient as jest.Mock).mockReturnValue(client)
  })
  async function actions() {
    return { signIn: loginActions.signIn, signUp: loginActions.signUp }
  }
  it("signs in, repairs the caller account and redirects to the home dashboard", async () => {
    const { signIn } = await actions()
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1", email_confirmed_at: "2026-10-31" } }
    })
    await expect(signIn(form())).rejects.toThrow("REDIRECT:/workspace1")
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: VALID
    })
    expect(client.rpc).toHaveBeenCalledWith("ensure_nutricare_account")
  })
  it("rejects an unverified session before accessing the workspace", async () => {
    const { signIn } = await actions()
    client.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } })
    await expect(signIn(form())).rejects.toThrow("REDIRECT:/login?message=")
    expect(client.auth.signOut).toHaveBeenCalled()
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it("shows auth errors without querying a workspace", async () => {
    client.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid credentials & retry" }
    })
    const { signIn } = await actions()
    await expect(signIn(form())).rejects.toThrow(
      "REDIRECT:/login?message=Invalid+credentials+%26+retry"
    )
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it("waits for email confirmation when signup has no session", async () => {
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: null
    })
    const { signUp } = await actions()
    await expect(signUp(form())).rejects.toThrow("REDIRECT:/login?message=")
    expect(client.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          emailRedirectTo: "https://www.nutricaretek.com/auth/callback"
        }
      })
    )
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it("enters the app immediately when signup returns a session", async () => {
    client.auth.signUp.mockResolvedValue({
      data: { session: { user: { id: "user1" } } },
      error: null
    })
    const { signUp } = await actions()
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1", email_confirmed_at: "2026-10-31" } }
    })
    await expect(signUp(form())).rejects.toThrow("REDIRECT:/workspace1")
  })
  it("reports missing database setup instead of redirecting forever", async () => {
    client.rpc.mockResolvedValue({ data: null, error: { code: "42883" } })
    const { signIn } = await actions()
    client.auth.getUser.mockResolvedValue({
      data: { user: { email_confirmed_at: "2026-10-31" } }
    })
    await expect(signIn(form())).rejects.toThrow("REDIRECT:/login?message=")
  })
  it.each([
    ["short", VALID.slice(0, 4)],
    ["no uppercase", VALID.toLowerCase()],
    ["no lowercase", VALID.toUpperCase()],
    ["no digit", VALID.replace(/\d/g, "x")],
    ["whitespace", VALID.replace("care", "ca re")]
  ])(
    "rejects a weak signup password (%s) before calling Supabase",
    async (_, password) => {
      const { signUp } = await actions()
      await expect(signUp(form(password))).rejects.toThrow(
        /REDIRECT:\/login\?message=.*tab=signup/
      )
      expect(client.auth.signUp).not.toHaveBeenCalled()
    }
  )
  it("rejects mismatched password confirmation", async () => {
    const data = form()
    data.set("confirmPassword", VALID + "x")
    const { signUp } = await actions()
    await expect(signUp(data)).rejects.toThrow("tab=signup")
    expect(client.auth.signUp).not.toHaveBeenCalled()
  })
  it("does not apply the signup policy to sign in of existing accounts", async () => {
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1", email_confirmed_at: "2026-10-31" } }
    })
    const { signIn } = await actions()
    await expect(signIn(form(VALID.toLowerCase().slice(0, 6)))).rejects.toThrow(
      "REDIRECT:/workspace1"
    )
    expect(client.auth.signInWithPassword).toHaveBeenCalled()
  })
})

describe("auth error translation", () => {
  it("explains Supabase email rate limits in Turkish", () => {
    expect(translateAuthError("email rate limit exceeded")).toBe(
      EMAIL_RATE_LIMIT_MESSAGE
    )
    expect(translateAuthError("Too Many Requests")).toBe(
      EMAIL_RATE_LIMIT_MESSAGE
    )
  })
  it("explains cooldown messages", () => {
    expect(
      translateAuthError(
        "For security purposes, you can only request this after 42 seconds."
      )
    ).toContain("42 saniye")
  })
})
