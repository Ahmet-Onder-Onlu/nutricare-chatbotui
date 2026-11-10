import { AuthShowcase } from "@/components/auth/auth-showcase"
import { LoginForm } from "@/components/auth/login-form"
import { LogoWordmark } from "@/components/nutricare/logo"
import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { enterApp } from "./actions"

export const metadata: Metadata = {
  title: "NutriCare | Giriş"
}

export default async function Login({
  searchParams
}: {
  searchParams: Promise<{ message?: string; tab?: string }>
}) {
  const params = await searchParams
  const supabase = createClient(await cookies())
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user && !params?.message) return enterApp(supabase)

  return (
    <div className="grid size-full min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <AuthShowcase />
      <section className="relative flex flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--nc-brand-from)/0.12),transparent_60%)]"
        />
        <div className="relative w-full max-w-sm">
          <Link
            href="/"
            className="nc-fade-up mb-8 flex justify-center lg:hidden"
          >
            <LogoWordmark size={40} />
          </Link>
          <div className="nc-fade-up mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">
              NutriCare&apos;a hoş geldiniz
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Sağlık profilinize göre kişiselleştirilmiş besin–ilaç rehberi.
            </p>
          </div>
          <LoginForm
            message={params?.message}
            initialTab={params?.tab === "signup" ? "signup" : "signin"}
          />
        </div>
      </section>
    </div>
  )
}
