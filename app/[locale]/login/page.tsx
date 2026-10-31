import { Brand } from "@/components/ui/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { createClient } from "@/lib/supabase/server"
import { get } from "@vercel/edge-config"
import { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "NutriCare | Giriş"
}

async function enterChat(client: ReturnType<typeof createClient>) {
  const {
    data: { user }
  } = await client.auth.getUser()
  if (!user?.email_confirmed_at) {
    await client.auth.signOut()
    return redirect(
      "/login?message=" +
        encodeURIComponent("Giriş yapmadan önce e-posta adresinizi doğrulayın.")
    )
  }
  const { data: workspaceId, error } = await client.rpc(
    "ensure_nutricare_account"
  )
  if (error || !workspaceId) {
    return redirect(
      "/login?message=" +
        encodeURIComponent(
          "Hesap çalışma alanı hazırlanamadı. Supabase migration dosyalarının uygulandığını kontrol edin."
        )
    )
  }
  return redirect(`/${workspaceId}/chat`)
}

export default async function Login({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const supabase = createClient(await cookies())
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user && !params?.message) return enterChat(supabase)

  const signIn = async (formData: FormData) => {
    "use server"

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase()
    const password = formData.get("password") as string
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return redirect(
        `/login?message=${encodeURIComponent(error.message === "Email not confirmed" ? "E-posta adresinizi doğrulayın. Gerekirse aşağıdan yeni onay bağlantısı isteyin." : error.message)}`
      )
    }

    return enterChat(supabase)
  }

  const getEnvVarOrEdgeConfigValue = async (name: string) => {
    "use server"
    if (process.env.EDGE_CONFIG) {
      return await get<string>(name)
    }

    return process.env[name]
  }

  const signUp = async (formData: FormData) => {
    "use server"

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase()
    const password = formData.get("password") as string

    const emailDomainWhitelistPatternsString = await getEnvVarOrEdgeConfigValue(
      "EMAIL_DOMAIN_WHITELIST"
    )
    const emailDomainWhitelist = emailDomainWhitelistPatternsString?.trim()
      ? emailDomainWhitelistPatternsString
          .split(",")
          .map(value => value.trim().toLowerCase())
      : []
    const emailWhitelistPatternsString =
      await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
    const emailWhitelist = emailWhitelistPatternsString?.trim()
      ? emailWhitelistPatternsString
          .split(",")
          .map(value => value.trim().toLowerCase())
      : []

    // If there are whitelist patterns, check if the email is allowed to sign up
    if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
      const domainMatch = emailDomainWhitelist?.includes(email.split("@")[1])
      const emailMatch = emailWhitelist?.includes(email)
      if (!domainMatch && !emailMatch) {
        return redirect(
          `/login?message=${encodeURIComponent("Bu e-posta adresiyle kayıt olunmasına izin verilmiyor.")}`
        )
      }
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`
      }
    })

    if (error) {
      console.error(error)
      return redirect(
        `/login?message=${encodeURIComponent(error.message === "Email not confirmed" ? "E-posta adresinizi doğrulayın. Gerekirse aşağıdan yeni onay bağlantısı isteyin." : error.message)}`
      )
    }

    if (data.session) return enterChat(supabase)
    return redirect(
      "/login?message=" +
        encodeURIComponent(
          "Hesabınızı etkinleştirmek için e-posta adresinize gönderilen onay bağlantısına tıklayın. Ardından giriş yapabilirsiniz."
        )
    )
  }

  const resendConfirmation = async (formData: FormData) => {
    "use server"
    const supabase = createClient(await cookies())
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),
      options: {
        emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`
      }
    })
    return redirect(
      "/login?message=" +
        encodeURIComponent(
          error
            ? "Onay e-postası gönderilemedi. Lütfen biraz sonra tekrar deneyin."
            : "Doğrulama bekleyen bir hesabınız varsa onay bağlantısı e-posta adresinize gönderildi."
        )
    )
  }

  const handleResetPassword = async (formData: FormData) => {
    "use server"

    const origin = (await headers()).get("origin")
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase()
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/login/password`
    })

    if (error) {
      return redirect(
        `/login?message=${encodeURIComponent(error.message === "Email not confirmed" ? "E-posta adresinizi doğrulayın. Gerekirse aşağıdan yeni onay bağlantısı isteyin." : error.message)}`
      )
    }

    return redirect("/login?message=Check email to reset password")
  }

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <form
        className="animate-in text-foreground flex w-full flex-1 flex-col justify-center gap-2"
        action={signIn}
      >
        <Brand />

        <Label className="text-md mt-4" htmlFor="email">
          E-posta
        </Label>
        <Input
          className="mb-3 rounded-md border bg-inherit px-4 py-2"
          id="email"
          type="email"
          autoComplete="email"
          name="email"
          placeholder="you@example.com"
          required
        />

        <Label className="text-md" htmlFor="password">
          Şifre
        </Label>
        <Input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          id="password"
          autoComplete="current-password"
          type="password"
          name="password"
          placeholder="••••••••"
        />

        <SubmitButton className="mb-2 rounded-md bg-blue-700 px-4 py-2 text-white">
          Giriş yap
        </SubmitButton>

        <SubmitButton
          formAction={signUp}
          className="border-foreground/20 mb-2 rounded-md border px-4 py-2"
        >
          Kayıt ol
        </SubmitButton>

        <SubmitButton
          formAction={resendConfirmation}
          className="mb-2 text-sm underline"
        >
          Doğrulama e-postasını yeniden gönder
        </SubmitButton>

        <div className="text-muted-foreground mt-1 flex justify-center text-sm">
          <span className="mr-1">Şifrenizi mi unuttunuz?</span>
          <button
            formAction={handleResetPassword}
            className="text-primary ml-1 underline hover:opacity-80"
          >
            Sıfırla
          </button>
        </div>

        {params?.message && (
          <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center">
            {params.message}
          </p>
        )}
      </form>
    </div>
  )
}
