import { chunkText } from "./chunks"
export const processTxt = async (txt: Blob) => chunkText(await txt.text())
