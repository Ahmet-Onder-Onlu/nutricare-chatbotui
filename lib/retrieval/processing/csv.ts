import { chunkText } from "./chunks"
export const processCSV = async (csv: Blob) => chunkText(await csv.text())
