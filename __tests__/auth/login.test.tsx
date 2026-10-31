/** @jest-environment node */
import Login from "@/app/[locale]/login/page"
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
jest.mock("@/components/ui/brand", () => ({ Brand: () => null }))
jest.mock("@/components/ui/submit-button", () => ({ SubmitButton: () => null }))

function form() {
  const data = new FormData()
  data.set("email", " TEST@example.com ")
  data.set("password", "test-password")
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
    const page = await Login({ searchParams: { message: "" } })
    const formElement = page.props.children
    const children = formElement.props.children
    return {
      signIn: formElement.props.action,
      signUp: children.find((item: any) => item?.props?.children === "Kayıt ol")
        .props.formAction
    }
  }
  it("signs in, repairs the caller account and redirects into chat", async () => {
    const { signIn } = await actions()
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1", email_confirmed_at: "2026-10-31" } }
    })
    await expect(signIn(form())).rejects.toThrow("REDIRECT:/workspace1/chat")
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "test-password"
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
      "REDIRECT:/login?message=Invalid%20credentials%20%26%20retry"
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
  it("enters chat immediately when signup returns a session", async () => {
    client.auth.signUp.mockResolvedValue({
      data: { session: { user: { id: "user1" } } },
      error: null
    })
    const { signUp } = await actions()
    client.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1", email_confirmed_at: "2026-10-31" } }
    })
    await expect(signUp(form())).rejects.toThrow("REDIRECT:/workspace1/chat")
  })
  it("reports missing database setup instead of redirecting forever", async () => {
    client.rpc.mockResolvedValue({ data: null, error: { code: "42883" } })
    const { signIn } = await actions()
    client.auth.getUser.mockResolvedValue({
      data: { user: { email_confirmed_at: "2026-10-31" } }
    })
    await expect(signIn(form())).rejects.toThrow("REDIRECT:/login?message=")
  })
})
