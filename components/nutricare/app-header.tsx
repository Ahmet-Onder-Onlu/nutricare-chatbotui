"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import {
  IconHome,
  IconLogout,
  IconMenu2,
  IconMessageChatbot,
  IconMoon,
  IconSun,
  IconUserHeart,
  IconX
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { LogoWordmark } from "./logo"

export const AppHeader: FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const root = document.getElementById("nc-scroll-root")
    const target: HTMLElement | Window = root || window
    const onScroll = () =>
      setScrolled((root ? root.scrollTop : window.scrollY) > 8)
    target.addEventListener("scroll", onScroll, { passive: true })
    return () => target.removeEventListener("scroll", onScroll)
  }, [])
  useEffect(() => setMenuOpen(false), [pathname])

  const links = [
    { href: `/${workspaceId}`, label: "Ana sayfa", Icon: IconHome },
    {
      href: `/${workspaceId}/profile`,
      label: "Sağlık profilim",
      Icon: IconUserHeart
    },
    { href: `/${workspaceId}/chat`, label: "Asistan", Icon: IconMessageChatbot }
  ]

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-transparent transition-all duration-300",
        scrolled && "bg-background/80 border-border shadow-sm backdrop-blur-lg"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={`/${workspaceId}`} aria-label="NutriCare ana sayfa">
          <LogoWordmark size={34} />
        </Link>
        <nav
          aria-label="Ana menü"
          className="hidden items-center gap-1 md:flex"
        >
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={18} />
                {label}
                {active && (
                  <span className="nc-gradient-bg absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Temayı değiştir"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-10 items-center justify-center rounded-xl transition-colors"
          >
            {mounted && theme === "dark" ? (
              <IconSun size={20} />
            ) : (
              <IconMoon size={20} />
            )}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="hover:bg-muted text-muted-foreground hover:text-foreground hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:inline-flex"
          >
            <IconLogout size={18} /> Çıkış
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
            className="hover:bg-muted flex size-10 items-center justify-center rounded-xl md:hidden"
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          aria-label="Mobil menü"
          className="nc-pop bg-background/95 border-b px-4 pb-4 backdrop-blur md:hidden"
        >
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl p-3 text-sm font-medium",
                pathname === href ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={signOut}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium"
          >
            <IconLogout size={18} /> Çıkış yap
          </button>
        </nav>
      )}
    </header>
  )
}
