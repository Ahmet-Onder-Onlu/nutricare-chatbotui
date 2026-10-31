import { chunkText } from "./chunks"
export const processMarkdown = async (markdown: Blob) =>
  chunkText(await markdown.text())
