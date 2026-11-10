"use server"

import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE
} from "@/lib/auth/password"
import { createClient } from "@/lib/supabase/server"
import { get } from "@vercel/edge-config"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

const EMAIL_NOT_CONFIRMED =
  "E-posta adresinizi doğrulayın. Gerekirse aşağıdan yeni onay bağlantısı isteyin."

function loginRedirect(message: string, tab?: "signup"): never {
  const query = new URLSearchParams({ message })
  if (tab) query.set("tab", tab)
  return redirect(`/login?${query.toString()}`)
}

function readEmail(formData: FormData) {
  return String(formData.get("email") || "")
    .trim()
    .toLowerCase()
}

function translateAuthError(message: string) {
  if (message === "Email not confirmed") return EMAIL_NOT_CONFIRMED
  if (message === "Invalid login credentials")
    return "E-posta veya şifre hatalı."
  if (/already registered/i.test(message))
    return "Bu e-posta adresiyle kayıtlı bir hesap var. Giriş yapmayı deneyin."
  if (
    /password/i.test(message) &&
    /(weak|short|least|character)/i.test(message)
  )
    return PASSWORD_REQUIREMENT_MESSAGE
  return message
}

export async function enterApp(client: ReturnType<typeof createClient>) {
  const {
    data: { user }
  } = await client.auth.getUser()
  if (!user?.email_confirmed_at) {
    await client.auth.signOut()
    return loginRedirect("Giriş yapmadan önce e-posta adresinizi doğrulayın.")
  }
  const { data: workspaceId, error } = await client.rpc(
    "ensure_nutricare_account"
  )
  if (error || !workspaceId) {
    return loginRedirect(
      "Hesap çalışma alanı hazırlanamadı. Supabase migration dosyalarının uygulandığını kontrol edin."
    )
  }
  return redirect(`/${workspaceId}`)
}

export async function signIn(formData: FormData) {
  const email = readEmail(formData)
  const password = String(formData.get("password") || "")
  const supabase = createClient(await cookies())

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return loginRedirect(translateAuthError(error.message))

  return enterApp(supabase)
}

async function getEnvVarOrEdgeConfigValue(name: string) {
  if (process.env.EDGE_CONFIG) return await get<string>(name)
  return process.env[name]
}

function parseList(value?: string) {
  return value?.trim()
    ? value.split(",").map(item => item.trim().toLowerCase())
    : []
}

export async function signUp(formData: FormData) {
  const email = readEmail(formData)
  const password = String(formData.get("password") || "")
  const confirmPassword = formData.get("confirmPassword")

  if (!isStrongPassword(password))
    return loginRedirect(PASSWORD_REQUIREMENT_MESSAGE, "signup")
  if (confirmPassword !== null && confirmPassword !== password)
    return loginRedirect("Şifreler birbiriyle eşleşmiyor.", "signup")

  const emailDomainWhitelist = parseList(
    await getEnvVarOrEdgeConfigValue("EMAIL_DOMAIN_WHITELIST")
  )
  const emailWhitelist = parseList(
    await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
  )
  if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
    const domainMatch = emailDomainWhitelist.includes(email.split("@")[1])
    const emailMatch = emailWhitelist.includes(email)
    if (!domainMatch && !emailMatch)
      return loginRedirect(
        "Bu e-posta adresiyle kayıt olunmasına izin verilmiyor.",
        "signup"
      )
  }

  const supabase = createClient(await cookies())
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`
    }
  })

  if (error) {
    console.error(error)
    return loginRedirect(translateAuthError(error.message), "signup")
  }

  if (data.session) return enterApp(supabase)
  return loginRedirect(
    "Hesabınızı etkinleştirmek için e-posta adresinize gönderilen onay bağlantısına tıklayın. Ardından giriş yapabilirsiniz."
  )
}

export async function resendConfirmation(formData: FormData) {
  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: readEmail(formData),
    options: {
      emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`
    }
  })
  return loginRedirect(
    error
      ? "Onay e-postası gönderilemedi. Lütfen biraz sonra tekrar deneyin."
      : "Doğrulama bekleyen bir hesabınız varsa onay bağlantısı e-posta adresinize gönderildi."
  )
}

export async function resetPassword(formData: FormData) {
  const origin = (await headers()).get("origin")
  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.resetPasswordForEmail(
    readEmail(formData),
    { redirectTo: `${origin}/auth/callback?next=/login/password` }
  )
  if (error) return loginRedirect(translateAuthError(error.message))
  return loginRedirect(
    "Şifre sıfırlama bağlantısı için e-posta kutunuzu kontrol edin."
  )
}
