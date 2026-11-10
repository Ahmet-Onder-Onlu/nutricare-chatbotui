export interface NewsItem {
  id: string
  title: string
  link: string
  summary: string
  publishedAt: string | null
  source: string
  sourceUrl: string
  critical: boolean
  language: "en" | "tr"
}

export interface NewsSource {
  id: string
  name: string
  url: string
  homepage: string
  language: "en" | "tr"
  /** Bu kaynaktaki haberler varsayılan olarak güvenlik uyarısı mı? */
  safetyFeed: boolean
  /** Genel bir haber akışıysa yalnızca bu ifadelerden birini içerenleri al. */
  include?: RegExp
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "fda-medwatch",
    name: "FDA MedWatch",
    url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml",
    homepage:
      "https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program",
    language: "en",
    safetyFeed: true
  },
  {
    id: "ema",
    name: "EMA",
    url: "https://www.ema.europa.eu/en/news.xml",
    homepage: "https://www.ema.europa.eu/en/news-events",
    language: "en",
    safetyFeed: false,
    include:
      /safety|prac|risk|recall|shortage|warning|interaction|side effect|adverse|suspend|withdraw|restrict|contaminat|medication error/i
  }
]

const CRITICAL =
  /recall|death|fatal|life[- ]threatening|serious|contaminat|counterfeit|boxed warning|suspend|withdraw|shortage|do not use|stop using|bleeding|toxicity/i

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  reg: "®",
  trade: "™"
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1].toLowerCase() === "x"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10)
      return Number.isFinite(n) && n > 0 && n < 0x110000
        ? String.fromCodePoint(n)
        : ""
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

function tag(xml: string, name: string): string {
  const match = xml.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i")
  )
  if (!match) return ""
  return match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1")
}

export function toPlainText(html: string): string {
  // Önce varlıkları çöz (kodlanmış HTML gelebilir), sonra etiketleri temizle.
  return decodeEntities(
    decodeEntities(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()
}

function safeLink(link: string, base: string): string | null {
  try {
    const url = new URL(link.trim(), base)
    if (url.protocol === "http:") url.protocol = "https:"
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

export function parseRss(xml: string, source: NewsSource): NewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []
  const result: NewsItem[] = []
  for (const raw of items) {
    const title = toPlainText(tag(raw, "title"))
    const link = safeLink(toPlainText(tag(raw, "link")), source.homepage)
    if (!title || !link) continue
    const summary = toPlainText(tag(raw, "description")).slice(0, 280)
    if (source.include && !source.include.test(`${title} ${summary}`)) continue
    const dateText = toPlainText(tag(raw, "pubDate") || tag(raw, "dc:date"))
    const date = dateText ? new Date(dateText) : null
    result.push({
      id: `${source.id}:${link}`,
      title: title.slice(0, 220),
      link,
      summary,
      publishedAt: date && !isNaN(date.getTime()) ? date.toISOString() : null,
      source: source.name,
      sourceUrl: source.homepage,
      critical: CRITICAL.test(`${title} ${summary}`),
      language: source.language
    })
  }
  return result
}

export function mergeNews(groups: NewsItem[][], limit = 12): NewsItem[] {
  const seen = new Set<string>()
  return groups
    .flat()
    .filter(item => (seen.has(item.link) ? false : (seen.add(item.link), true)))
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
    .slice(0, limit)
}
