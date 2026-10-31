import { safeNextPath } from "@/lib/auth/redirect"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type")
  if (
    tokenHash &&
    (type === "email" || type === "signup" || type === "recovery")
  ) {
    const supabase = createClient(await cookies())
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    })
    if (!error) {
      return NextResponse.redirect(
        new URL(
          type === "recovery"
            ? "/login/password"
            : safeNextPath(url.searchParams.get("next")),
          url.origin
        )
      )
    }
  }
  if (code) {
    const supabase = createClient(await cookies())
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(
        new URL(safeNextPath(url.searchParams.get("next")), url.origin)
      )
    }
  }
  return NextResponse.redirect(
    new URL(
      "/login?message=" +
        encodeURIComponent(
          "Onay bağlantısı geçersiz veya süresi dolmuş. Lütfen yeniden giriş yapın ya da yeni bir bağlantı isteyin."
        ),
      url.origin
    )
  )
}
