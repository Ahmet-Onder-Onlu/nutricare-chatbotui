export async function generateLocalEmbedding(
  _content: string
): Promise<number[]> {
  throw new Error(
    "Yerel embedding desteği kaldırıldı. Dosya araması için OpenAI embeddings kullanın."
  )
}
