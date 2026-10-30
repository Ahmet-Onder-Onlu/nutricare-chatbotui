import { createClient } from "@/lib/supabase/middleware"
import { i18nRouter } from "next-i18n-router"
import { type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"

export async function middleware(request: NextRequest) {
  const client = createClient(request)
  await client.supabase.auth.getUser()
  const response = client.response
  const localeResponse = i18nRouter(request, i18nConfig)
  if (!localeResponse) return response
  for (const cookie of response.cookies.getAll()) {
    localeResponse.cookies.set(cookie)
  }
  return localeResponse
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
}
