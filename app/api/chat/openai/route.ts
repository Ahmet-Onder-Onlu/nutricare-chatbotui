import {
  getNutricareContext,
  NUTRICARE_SYSTEM_PROMPT
} from "@/lib/server/nutricare-context"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  try {
    const { chatSettings, messages } = (await request.json()) as {
      chatSettings: ChatSettings
      messages: any[]
    }
    if (
      !chatSettings ||
      !Array.isArray(messages) ||
      !messages.length ||
      messages.length > 200
    ) {
      return Response.json(
        { message: "Geçerli bir sohbet mesajı gönderin." },
        { status: 400 }
      )
    }
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    const lastUserMessage = [...messages]
      .reverse()
      .find(message => message.role === "user")
    const userText =
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : Array.isArray(lastUserMessage?.content)
          ? lastUserMessage.content
              .filter((part: any) => part.type === "text")
              .map((part: any) => part.text)
              .join(" ")
          : ""
    if (!userText.trim())
      return Response.json(
        { message: "Lütfen sorunuzu yazın." },
        { status: 400 }
      )
    const context = await getNutricareContext(userText.slice(0, 4000))
    const clinicalMessages = [
      { role: "system", content: NUTRICARE_SYSTEM_PROMPT },
      ...messages,
      { role: "system", content: `NutriCare kaynak araması:\n${context}` }
    ]

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: clinicalMessages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens: 4096,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode =
      error.status || (error.message === "User not found" ? 401 : 500)

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
