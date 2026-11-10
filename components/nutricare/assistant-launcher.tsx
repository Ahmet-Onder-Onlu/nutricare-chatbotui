"use client"

import { cn } from "@/lib/utils"
import {
  IconArrowRight,
  IconMessageChatbot,
  IconSend,
  IconSparkles,
  IconX
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { FC, FormEvent, useEffect, useRef, useState } from "react"
import { askAssistantHref } from "./interaction-card"
import { LogoMark } from "./logo"

const DEFAULT_SUGGESTIONS = [
  "Simvastatin kullanırken greyfurt suyu içebilir miyim?",
  "Kahve ile levotiroksin alınır mı?",
  "Varfarin kullanırken hangi besinlere dikkat etmeliyim?"
]

/** Sağ altta duran "Asistana sor" sembolü; sohbete buradan geçilir. */
export const AssistantLauncher: FC<{
  workspaceId: string
  suggestions?: string[]
}> = ({ workspaceId, suggestions = DEFAULT_SUGGESTIONS }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const go = (question: string) => {
    if (!question.trim()) return router.push(`/${workspaceId}/chat`)
    router.push(askAssistantHref(workspaceId, question.trim()))
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    go(text)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Besin–İlaç Asistanı"
          className="nc-pop bg-card w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-3xl border shadow-2xl"
        >
          <div className="nc-gradient-bg flex items-center justify-between px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <LogoMark size={30} className="bg-white/20 bg-none shadow-none" />
              <div>
                <p className="text-sm font-semibold">Besin–İlaç Asistanı</p>
                <p className="flex items-center gap-1 text-[11px] text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-300" />{" "}
                  Kaynaklı yanıtlar
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Kapat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-white/15"
            >
              <IconX size={18} />
            </button>
          </div>
          <div className="space-y-3 p-4">
            <div className="bg-muted rounded-2xl rounded-tl-sm p-3 text-sm">
              Merhaba! Kullandığınız ilaçlar ve besinler arasındaki
              etkileşimleri kaynak göstererek açıklayabilirim. Ne sormak
              istersiniz?
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((question, index) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => go(question)}
                  className="nc-fade-up hover:border-primary hover:bg-primary/5 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span>{question}</span>
                  <IconArrowRight size={14} className="text-primary shrink-0" />
                </button>
              ))}
            </div>
            <form
              onSubmit={submit}
              className="flex items-center gap-2 rounded-xl border p-1 pl-3"
            >
              <input
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Bir mesaj yazın…"
                aria-label="Asistana sorunuz"
                maxLength={500}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg"
                aria-label="Gönder"
              >
                <IconSend size={16} />
              </button>
            </form>
            <button
              type="button"
              onClick={() => go("")}
              className="text-primary w-full text-center text-xs font-medium"
            >
              Tam sohbet ekranını aç →
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-label={open ? "Asistanı kapat" : "Asistana sor"}
        className={cn(
          "nc-gradient-bg nc-pulse-ring relative isolate flex items-center gap-2 rounded-full py-3 pl-3 pr-4 font-semibold text-white shadow-xl shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95",
          open && "px-3 [&::before]:hidden"
        )}
      >
        {open ? (
          <IconX size={24} />
        ) : (
          <>
            <span className="relative">
              <IconMessageChatbot size={26} />
              <IconSparkles
                size={12}
                className="absolute -right-1 -top-1 text-amber-200"
              />
            </span>
            <span className="text-sm">Asistana sor</span>
          </>
        )}
      </button>
    </div>
  )
}
