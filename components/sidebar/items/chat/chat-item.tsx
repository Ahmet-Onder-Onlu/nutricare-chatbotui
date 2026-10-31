import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { IconMessage } from "@tabler/icons-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useContext } from "react"
import { DeleteChat } from "./delete-chat"
import { UpdateChat } from "./update-chat"

export const ChatItem = ({ chat }: { chat: Tables<"chats"> }) => {
  const { selectedWorkspace, selectedChat } = useContext(ChatbotUIContext)
  const params = useParams()
  const active = params.chatid === chat.id || selectedChat?.id === chat.id
  if (!selectedWorkspace) return null
  return (
    <div
      className={cn(
        "hover:bg-accent flex min-w-0 items-center rounded p-2",
        active && "bg-accent"
      )}
    >
      <Link
        prefetch={false}
        href={`/${selectedWorkspace.id}/chat/${chat.id}`}
        aria-current={active ? "page" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <IconMessage size={20} className="shrink-0" />
        <span className="truncate text-sm font-medium">{chat.name}</span>
      </Link>
      <div className="ml-1 flex shrink-0">
        <UpdateChat chat={chat} />
        <DeleteChat chat={chat} />
      </div>
    </div>
  )
}
