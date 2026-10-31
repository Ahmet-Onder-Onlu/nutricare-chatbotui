"use client"
import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getFoldersByWorkspaceId } from "@/db/folders"
import { getWorkspaceById } from "@/db/workspaces"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const workspaceId = useParams().workspaceid as string
  const {
    setChatSettings,
    setChats,
    setFolders,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)
    setIsGenerating(false)
    setFirstTokenReceived(false)
    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
    ;(async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session
        if (!active) return
        if (!session) {
          router.replace("/login")
          return
        }
        const [workspace, chats, folders] = await Promise.all([
          getWorkspaceById(workspaceId),
          getChatsByWorkspaceId(workspaceId),
          getFoldersByWorkspaceId(workspaceId)
        ])
        if (!active) return
        setSelectedWorkspace(workspace)
        setChats(chats)
        setFolders(folders.filter(folder => folder.type === "chats"))
        setChatSettings({
          model: (workspace.default_model || "gemini-3.5-flash-lite") as LLMID,
          prompt:
            workspace.default_prompt ||
            "Klinik beslenme hakkında açık ve anlaşılır bilgi ver.",
          temperature: workspace.default_temperature ?? 0.5,
          contextLength: workspace.default_context_length ?? 4096,
          includeProfileContext: workspace.include_profile_context ?? true,
          includeWorkspaceInstructions:
            workspace.include_workspace_instructions ?? true,
          embeddingsProvider:
            (workspace.embeddings_provider as "openai" | "local") || "openai"
        })
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [
    workspaceId,
    retry,
    router,
    setChatSettings,
    setChats,
    setFolders,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  ])
  if (loading) return <Loading />
  if (error)
    return (
      <div role="alert" className="p-6 text-center">
        Sohbet geçmişi yüklenemedi.{" "}
        <button
          className="underline"
          onClick={() => setRetry(value => value + 1)}
        >
          Tekrar dene
        </button>
      </div>
    )
  return <Dashboard>{children}</Dashboard>
}
