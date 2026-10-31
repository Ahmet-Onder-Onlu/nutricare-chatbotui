import { GOOGLE_LLM_LIST } from "@/lib/models/llm/google-llm-list"
import { ChatbotUIContext } from "@/context/context"
import {
  getUserApiKey,
  setUserApiKey,
  subscribeUserApiKey
} from "@/lib/client/user-api-key"
import { IconAdjustmentsHorizontal } from "@tabler/icons-react"
import { useContext, useState, useSyncExternalStore } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { LLMID } from "@/types"

export const ChatSettings = () => {
  const { chatSettings, setChatSettings, availableHostedModels } =
    useContext(ChatbotUIContext)
  const personalKey = useSyncExternalStore(
    subscribeUserApiKey,
    getUserApiKey,
    () => ""
  )
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  if (!chatSettings) return null
  const models = availableHostedModels.filter(
    model => model.provider === "google"
  )
  const label = (id: string) =>
    GOOGLE_LLM_LIST.find(model => model.modelId === id)?.modelName ||
    "Standart model"
  const current = models.find(model => model.modelId === chatSettings.model)
  const saveKey = () => {
    if (!/^[A-Za-z0-9_-]{20,256}$/.test(draft.trim())) {
      setError("Geçerli bir Gemini API anahtarı girin.")
      return
    }
    setUserApiKey(draft)
    setDraft("")
    setError("")
  }
  return (
    <Popover
      onOpenChange={open => {
        if (!open) {
          setDraft("")
          setError("")
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          aria-label="Model ve API ayarları"
          className="flex max-w-[130px] items-center gap-2 px-2 sm:max-w-[240px]"
          variant="ghost"
        >
          <span className="truncate text-sm">{label(chatSettings.model)}</span>
          <IconAdjustmentsHorizontal className="shrink-0" size={22} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(350px,calc(100vw-24px))] p-4"
      >
        <Tabs defaultValue="model">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="model">Model seçimi</TabsTrigger>
            <TabsTrigger value="api">API gir</TabsTrigger>
          </TabsList>
          <TabsContent value="model" className="space-y-3 pt-3">
            <Label htmlFor="chat-model">Model</Label>
            <select
              id="chat-model"
              className="bg-background w-full rounded border p-2 text-sm"
              value={chatSettings.model}
              onChange={event =>
                setChatSettings({
                  ...chatSettings,
                  model: event.target.value as LLMID
                })
              }
            >
              {!current && (
                <option value={chatSettings.model}>
                  {label(chatSettings.model)}
                </option>
              )}
              {models.map(model => (
                <option key={model.modelId} value={model.modelId}>
                  {label(model.modelId)}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              {personalKey
                ? "Kişisel Gemini API anahtarınız kullanılıyor."
                : "Uygulamanın mevcut API anahtarı kullanılıyor."}
            </p>
          </TabsContent>
          <TabsContent value="api" className="space-y-3 pt-3">
            <Label htmlFor="personal-api-key">
              Kişisel Gemini API anahtarı
            </Label>
            <Input
              id="personal-api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              maxLength={256}
              placeholder="Gemini API anahtarınız"
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") saveKey()
              }}
            />
            <p className="text-muted-foreground text-xs">
              Yalnızca bu sekmede tutulur; sayfa yenilenince silinir. Anahtar
              Google Gemini isteklerinde kullanılır.
            </p>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            {personalKey && (
              <p role="status" className="text-sm">
                Kişisel anahtar etkin.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button disabled={!draft.trim()} onClick={saveKey}>
                Bu sekmede kullan
              </Button>
              {personalKey && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserApiKey("")
                    setDraft("")
                  }}
                >
                  Mevcut API’ye dön
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
