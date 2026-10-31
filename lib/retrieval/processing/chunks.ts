import { encode } from "gpt-tokenizer"
import { FileItemChunk } from "@/types"

// Plain text only: no agent/document deserialization or executable loaders.
export function chunkText(text: string): FileItemChunk[] {
  const chunks: FileItemChunk[] = []
  for (let start = 0; start < text.length; ) {
    let end = Math.min(start + 4000, text.length)
    if (end < text.length) {
      const boundary = Math.max(
        text.lastIndexOf("\n", end),
        text.lastIndexOf(" ", end)
      )
      if (boundary > start + 2000) end = boundary
    }
    const content = text.slice(start, end).trim()
    if (content) chunks.push({ content, tokens: encode(content).length })
    if (end === text.length) break
    start = end - 200
  }
  return chunks
}
