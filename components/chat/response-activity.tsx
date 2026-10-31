import { ChatbotUIContext } from "@/context/context"
import { useContext } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"

export function ResponseActivity() {
  const { isGenerating, firstTokenReceived } = useContext(ChatbotUIContext)
  const waiting = isGenerating && !firstTokenReceived
  return (
    <div
      className="flex min-w-0 items-center gap-2"
      role="status"
      aria-live="polite"
    >
      <div
        className={`response-activity relative flex size-14 shrink-0 items-center justify-center ${waiting ? "response-activity-waiting" : ""}`}
      >
        <svg
          viewBox="0 0 60 60"
          aria-hidden="true"
          className="absolute inset-0 size-full fill-none stroke-current text-blue-400"
          strokeWidth="1.5"
        >
          <circle
            className="activity-circle"
            cx="30"
            cy="30"
            r="24"
            pathLength="100"
          />
          <path
            className="activity-triangle"
            d="M30 5 56 51H4Z"
            pathLength="100"
          />
          <rect
            className="activity-square"
            x="8"
            y="8"
            width="44"
            height="44"
            rx="3"
            pathLength="100"
          />
        </svg>
        <div className="activity-mark transition-transform duration-300">
          <ChatbotUISVG theme="light" scale={0.25} />
        </div>
      </div>
      <span className="text-muted-foreground text-xs">
        {waiting ? "Yanıt hazırlanıyor…" : "NutriCare"}
      </span>
    </div>
  )
}
