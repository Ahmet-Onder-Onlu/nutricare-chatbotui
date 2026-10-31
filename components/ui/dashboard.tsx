"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { Button } from "@/components/ui/button"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconMenu2, IconX } from "@tabler/icons-react"
import { FC, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export const SIDEBAR_WIDTH = 300

export const Dashboard: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    setShowSidebar(
      window.innerWidth >= 768 && localStorage.getItem("showSidebar") === "true"
    )
  }, [])
  useEffect(() => {
    if (window.innerWidth < 768) setShowSidebar(false)
  }, [pathname])
  const toggleSidebar = () =>
    setShowSidebar(previous => {
      localStorage.setItem("showSidebar", String(!previous))
      return !previous
    })
  useHotkey("s", toggleSidebar)
  return (
    <div className="relative flex size-full min-w-0 overflow-hidden">
      {showSidebar && (
        <>
          <button
            aria-label="Sohbet geçmişini kapat"
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
          <aside
            aria-label="Sohbet geçmişi"
            className="bg-background fixed inset-y-0 left-0 z-30 flex w-[min(300px,85vw)] shrink-0 flex-col border-r md:relative md:w-[300px]"
          >
            <div className="flex items-center justify-between border-b px-3 py-2">
              <h2 className="font-semibold">Sohbet geçmişi</h2>
              <Button
                aria-label="Geçmişi kapat"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
              >
                <IconX size={20} />
              </Button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}
      <main className="bg-muted/50 relative flex min-w-0 flex-1 flex-col">
        {children}
        {!showSidebar && (
          <Button
            aria-label="Sohbet geçmişini aç"
            title="Sohbet geçmişi"
            className="absolute left-2 top-2 z-10"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <IconMenu2 size={22} />
          </Button>
        )}
      </main>
    </div>
  )
}
