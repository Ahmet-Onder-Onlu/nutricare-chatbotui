"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatUI } from "@/components/chat/chat-ui"
import { SearchButton } from "@/components/chat/search-button"
import { LogoMark } from "@/components/nutricare/logo"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useContext, useEffect, useRef } from "react"

const STARTERS = [
  "Simvastatin kullanırken greyfurt suyu içebilir miyim?",
  "Varfarin kullanırken ıspanak yiyebilir miyim?",
  "Kahve ile levotiroksin arasında ne kadar beklemeliyim?",
  "Ginkgo biloba hangi ilaçlarla etkileşir?"
]

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = String(params.workspaceid)
  const {
    chatMessages,
    chatSettings,
    profile,
    selectedWorkspace,
    isGenerating,
    setUserInput
  } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput, handleSendMessage } =
    useChatHandler()

  // "Asistana sor" bileşeninden gelen soruyu bir kez otomatik gönder.
  const sentQuestion = useRef(false)
  const question = searchParams.get("q")?.trim().slice(0, 500) || ""
  useEffect(() => {
    if (!question || sentQuestion.current) return
    if (!chatSettings || !profile || !selectedWorkspace || isGenerating) return
    sentQuestion.current = true
    router.replace(`/${workspaceId}/chat`)
    handleSendMessage(question, [], false)
  }, [
    question,
    chatSettings,
    profile,
    selectedWorkspace,
    isGenerating,
    handleSendMessage,
    router,
    workspaceId
  ])

  return (
    <>
      {chatMessages.length === 0 && !question ? (
        <div className="relative flex h-full flex-col items-center justify-center">
          <Link
            href={`/${workspaceId}`}
            className="text-muted-foreground hover:text-foreground hover:bg-muted absolute left-14 top-2 z-10 inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium transition-colors"
          >
            <IconArrowLeft size={18} /> Ana sayfa
          </Link>

          <div className="absolute right-2 top-2">
            <ChatSettings />
          </div>

          <div className="flex w-full max-w-2xl grow flex-col items-center justify-center px-4">
            <div className="nc-fade-up relative">
              <span className="nc-pulse-ring absolute inset-0 rounded-2xl bg-blue-500/30" />
              <LogoMark size={64} className="nc-float relative" />
            </div>
            <h1 className="nc-fade-up nc-delay-1 mt-5 text-center text-2xl font-bold sm:text-3xl">
              Besin–İlaç <span className="nc-gradient-text">Asistanı</span>
            </h1>
            <p className="nc-fade-up nc-delay-2 text-muted-foreground mt-2 max-w-md text-center text-sm">
              Sorunuzu yazın; yanıtlar NutriCare kayıtlarına ve kaynaklarına
              dayanır. Sağlık profiliniz varsa yanıtlar ona göre uyarlanır.
            </p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
              {STARTERS.map((starter, index) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => {
                    setUserInput(starter)
                    handleFocusChatInput()
                  }}
                  className="nc-fade-up nc-card-hover bg-card hover:border-primary/60 rounded-2xl border p-3 text-left text-sm"
                  style={{ animationDelay: `${200 + index * 70}ms` }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full min-w-0 max-w-[800px] shrink-0 px-2 pb-3 pt-2 sm:px-4 sm:pb-8 sm:pt-5">
            <div className="mb-2 flex justify-end">
              <SearchButton />
            </div>
            <ChatInput />
          </div>
        </div>
      ) : (
        <ChatUI />
      )}
    </>
  )
}
