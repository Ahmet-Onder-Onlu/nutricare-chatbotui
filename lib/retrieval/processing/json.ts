import { chunkText } from "./chunks"
export const processJSON = async (json: Blob) =>
  chunkText(JSON.stringify(JSON.parse(await json.text()), null, 2))
