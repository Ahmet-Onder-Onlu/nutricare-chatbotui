import { FC } from "react"

interface ChatbotUISVGProps {
  theme: "dark" | "light"
  scale?: number
}

export const ChatbotUISVG: FC<ChatbotUISVGProps> = ({ theme, scale = 1 }) => {
  const imagePath = "/chatboticon.svg" // public klasöründen çağrılır
  const width = 189 * scale
  const height = 194 * scale

  const filter = theme === "dark" ? "invert(1)" : "none"

  return (
    <img
      src={imagePath}
      width={width}
      height={height}
      style={{ filter }}
      alt="NutriCare logosu"
    />
  )
}
