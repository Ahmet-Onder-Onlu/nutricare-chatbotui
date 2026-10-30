export function prepareGoogleMessages(messages: any[]) {
  const system: string[] = []
  const contents: { role: "user" | "model"; parts: any[] }[] = []
  for (const message of messages) {
    if (!message || !Array.isArray(message.parts))
      throw new Error("Geçersiz Gemini mesajı.")
    if (message.role === "system") {
      system.push(message.parts.map((part: any) => part.text || "").join("\n"))
      continue
    }
    if (message.role !== "user" && message.role !== "model")
      throw new Error("Geçersiz Gemini rolü.")
    const previous = contents[contents.length - 1]
    if (previous?.role === message.role) previous.parts.push(...message.parts)
    else contents.push({ role: message.role, parts: [...message.parts] })
  }
  if (
    !contents.length ||
    contents[0].role !== "user" ||
    contents[contents.length - 1].role !== "user"
  ) {
    throw new Error("Bir kullanıcı sorusu gönderin.")
  }
  const userText = contents[contents.length - 1].parts
    .map(part => part.text || "")
    .join(" ")
  return { system: system.join("\n\n"), contents, userText }
}
