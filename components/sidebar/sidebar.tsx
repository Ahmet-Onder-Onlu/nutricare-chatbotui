import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { ChatbotUIContext } from "@/context/context"
import { updateChat } from "@/db/chats"
import { createFolder, updateFolder, deleteFolder } from "@/db/folders"
import { Tables } from "@/supabase/types"
import {
  IconFolderPlus,
  IconPlus,
  IconEdit,
  IconTrash
} from "@tabler/icons-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { ChatItem } from "./items/chat/chat-item"

export const Sidebar = () => {
  const { chats, folders, setChats, setFolders, profile, selectedWorkspace } =
    useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()
  const [search, setSearch] = useState("")
  const [folderDialog, setFolderDialog] = useState<{
    folder?: Tables<"folders">
    remove?: boolean
  } | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const chatFolders = folders.filter(folder => folder.type === "chats")
  const visible = chats
    .filter(chat =>
      chat.name.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"))
    )
    .sort((a, b) =>
      (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at)
    )

  const moveChat = async (chat: Tables<"chats">, folderId: string) => {
    try {
      const updated = await updateChat(chat.id, { folder_id: folderId || null })
      setChats(previous =>
        previous.map(item => (item.id === chat.id ? updated : item))
      )
    } catch {
      toast.error("Sohbet taşınamadı. Lütfen tekrar deneyin.")
    }
  }
  const saveFolder = async () => {
    if (!profile || !selectedWorkspace || !folderDialog) return
    setSaving(true)
    try {
      const folder = folderDialog.folder
      if (folderDialog.remove && folder) {
        await deleteFolder(folder.id)
        setFolders(previous => previous.filter(item => item.id !== folder.id))
        setChats(previous =>
          previous.map(chat =>
            chat.folder_id === folder.id ? { ...chat, folder_id: null } : chat
          )
        )
      } else if (folder) {
        const updated = await updateFolder(folder.id, { name: name.trim() })
        setFolders(previous =>
          previous.map(item => (item.id === folder.id ? updated : item))
        )
      } else {
        const created = await createFolder({
          user_id: profile.user_id,
          workspace_id: selectedWorkspace.id,
          name: name.trim(),
          description: "",
          type: "chats"
        })
        setFolders(previous => [...previous, created])
      }
      setFolderDialog(null)
    } catch {
      toast.error("Klasör kaydedilemedi. Lütfen tekrar deneyin.")
    } finally {
      setSaving(false)
    }
  }
  const renderChat = (chat: Tables<"chats">) => (
    <div
      key={chat.id}
      className="min-w-0 rounded border border-transparent p-1"
    >
      <ChatItem chat={chat} />
      <select
        aria-label={`${chat.name} sohbetini klasöre taşı`}
        className="bg-background text-muted-foreground ml-2 max-w-[calc(100%-16px)] rounded border px-2 py-1 text-xs"
        value={chat.folder_id || ""}
        onChange={event => moveChat(chat, event.target.value)}
      >
        <option value="">Klasörsüz</option>
        {chatFolders.map(folder => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
    </div>
  )
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex gap-2">
        <Button className="min-h-[44px] flex-1" onClick={handleNewChat}>
          <IconPlus size={18} className="mr-2" />
          Yeni sohbet
        </Button>
        <Button
          aria-label="Yeni klasör"
          title="Yeni klasör"
          className="min-h-[44px]"
          variant="outline"
          size="icon"
          onClick={() => {
            setName("")
            setFolderDialog({})
          }}
        >
          <IconFolderPlus size={20} />
        </Button>
      </div>
      <Input
        aria-label="Sohbet geçmişinde ara"
        placeholder="Sohbetlerde ara..."
        value={search}
        onChange={event => setSearch(event.target.value)}
      />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {chatFolders.map(folder => (
          <details
            key={folder.id}
            open={search ? true : undefined}
            className="rounded border p-2"
          >
            <summary className="cursor-pointer break-words text-sm font-medium">
              {folder.name}
            </summary>
            <div className="my-2 flex justify-end gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label={`${folder.name} klasörünü yeniden adlandır`}
                onClick={() => {
                  setName(folder.name)
                  setFolderDialog({ folder })
                }}
              >
                <IconEdit size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`${folder.name} klasörünü sil`}
                onClick={() => setFolderDialog({ folder, remove: true })}
              >
                <IconTrash size={16} />
              </Button>
            </div>
            {visible
              .filter(chat => chat.folder_id === folder.id)
              .map(renderChat)}
          </details>
        ))}
        {visible
          .filter(
            chat =>
              !chat.folder_id ||
              !chatFolders.some(folder => folder.id === chat.folder_id)
          )
          .map(renderChat)}
        {!visible.length && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {search ? "Sohbet bulunamadı." : "Henüz sohbet yok."}
          </p>
        )}
      </div>
      <Dialog
        open={folderDialog !== null}
        onOpenChange={open => {
          if (!saving && !open) setFolderDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {folderDialog?.remove
                ? "Klasörü sil"
                : folderDialog?.folder
                  ? "Klasörü yeniden adlandır"
                  : "Yeni klasör"}
            </DialogTitle>
            {folderDialog?.remove && (
              <DialogDescription>
                Klasör silinecek; içindeki sohbetler klasörsüz olarak korunacak.
              </DialogDescription>
            )}
          </DialogHeader>
          {!folderDialog?.remove && (
            <Input
              autoFocus
              aria-label="Klasör adı"
              value={name}
              maxLength={100}
              onChange={event => setName(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && name.trim() && !saving)
                  saveFolder()
              }}
            />
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() => setFolderDialog(null)}
            >
              Vazgeç
            </Button>
            <Button
              disabled={saving || (!folderDialog?.remove && !name.trim())}
              onClick={saveFolder}
            >
              {saving
                ? "Kaydediliyor..."
                : folderDialog?.remove
                  ? "Klasörü sil"
                  : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
