import { mergeNews, NEWS_SOURCES, NewsItem, parseRss } from "@/lib/news/rss"

export const runtime = "nodejs"
// Resmi kaynaklar saatte bir yeniden okunur; ziyaretçi başına istek atılmaz.
export const revalidate = 3600

const MAX_BYTES = 2_000_000

async function fetchSource(source: (typeof NEWS_SOURCES)[number]) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "NutriCareNewsReader/1.0 (+https://www.nutricaretek.com)",
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.5"
      },
      next: { revalidate: 3600 }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    if (text.length > MAX_BYTES) throw new Error("Feed too large")
    return { items: parseRss(text, source), ok: true }
  } catch (error) {
    console.error(`[news] ${source.id} okunamadı:`, (error as Error).message)
    return { items: [] as NewsItem[], ok: false }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const results = await Promise.all(NEWS_SOURCES.map(fetchSource))
  const items = mergeNews(
    results.map(result => result.items),
    12
  )
  return Response.json(
    {
      items,
      sources: NEWS_SOURCES.map((source, index) => ({
        id: source.id,
        name: source.name,
        homepage: source.homepage,
        ok: results[index].ok
      })),
      fetchedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    }
  )
}
