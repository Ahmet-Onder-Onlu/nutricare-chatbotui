import { chunkText } from "./chunks"
import parse from "pdf-parse"
export const processPdf = async (pdf: Blob) =>
  chunkText((await parse(Buffer.from(await pdf.arrayBuffer()))).text)
