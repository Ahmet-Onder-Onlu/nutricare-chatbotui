import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import {
  IconCirclePlus,
  IconPlayerStopFilled,
  IconSend
} from "@tabler/icons-react"
import { useContext, useRef, useState } from "react"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ChatFilesDisplay } from "./chat-files-display"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history"
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"

export const ChatInput = () => {
  const { userInput, setUserInput, chatMessages, isGenerating } =
    useContext(ChatbotUIContext)
  const {
    chatInputRef,
    handleSendMessage,
    handleStopMessage,
    handleFocusChatInput
  } = useChatHandler()
  const { filesToAccept, handleSelectDeviceFile } = useSelectFileHandler()
  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  useHotkey("l", handleFocusChatInput)
  const send = () => {
    if (userInput.trim() && !isGenerating)
      handleSendMessage(userInput, chatMessages, false)
  }
  return (
    <>
      <ChatFilesDisplay />
      <div className="border-input relative flex min-h-[60px] w-full items-center rounded-xl border-2">
        <button
          aria-label="Dosya ekle"
          className="absolute bottom-3 left-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconCirclePlus size={32} />
        </button>
        <Input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept={filesToAccept}
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) handleSelectDeviceFile(file)
            event.target.value = ""
          }}
        />
        <TextareaAutosize
          textareaRef={chatInputRef}
          className="placeholder:text-muted-foreground flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none"
          placeholder="Beslenme veya ilaç etkileşimi hakkında sorun..."
          onValueChange={setUserInput}
          value={userInput}
          minRows={1}
          maxRows={8}
          onKeyDown={event => {
            if (!isTyping && event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              send()
            }
            if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
              event.preventDefault()
              setNewMessageContentToPreviousUserMessage()
            }
            if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
              event.preventDefault()
              setNewMessageContentToNextUserMessage()
            }
          }}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        />
        <button
          aria-label={isGenerating ? "Yanıtı durdur" : "Mesaj gönder"}
          disabled={!isGenerating && !userInput.trim()}
          className={cn(
            "absolute bottom-3 right-3 rounded p-1",
            !isGenerating && "bg-primary text-secondary disabled:opacity-50"
          )}
          onClick={isGenerating ? handleStopMessage : send}
        >
          {isGenerating ? (
            <IconPlayerStopFilled size={26} />
          ) : (
            <IconSend size={26} />
          )}
        </button>
      </div>
    </>
  )
}
