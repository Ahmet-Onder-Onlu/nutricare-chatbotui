import {
  decodeEntities,
  mergeNews,
  NEWS_SOURCES,
  parseRss
} from "@/lib/news/rss"

const fda = NEWS_SOURCES[0]
const ema = NEWS_SOURCES[1]

const xml = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Brand X Tablets: Recall &amp; Warning]]></title>
<link>http://www.fda.gov/safety/recalls/x</link>
<description>&lt;p&gt;Potential &lt;b&gt;contamination&lt;/b&gt;&lt;/p&gt;</description>
<pubDate>Mon, 09 Nov 2026 10:00:00 GMT</pubDate></item>
<item><title>Bad link</title><link>javascript:alert(1)</link></item>
<item><title>Routine update</title><link>https://www.fda.gov/a</link><pubDate>Tue, 10 Nov 2026 10:00:00 GMT</pubDate></item>
</channel></rss>`

describe("rss parsing", () => {
  it("parses items, strips HTML, upgrades to https and flags critical news", () => {
    const items = parseRss(xml, fda)
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      title: "Brand X Tablets: Recall & Warning",
      link: "https://www.fda.gov/safety/recalls/x",
      summary: "Potential contamination",
      critical: true,
      source: "FDA MedWatch"
    })
    expect(items[1].critical).toBe(false)
  })
  it("filters general feeds to safety-related news", () => {
    const items = parseRss(xml, ema)
    expect(items.map(i => i.title)).toEqual([
      "Brand X Tablets: Recall & Warning"
    ])
  })
  it("decodes numeric entities", () => {
    expect(decodeEntities("caf&#233; &#x2019;")).toBe("café ’")
  })
  it("merges, de-duplicates and sorts by date", () => {
    const items = parseRss(xml, fda)
    const merged = mergeNews([items, items])
    expect(merged).toHaveLength(2)
    expect(merged[0].title).toBe("Routine update")
  })
})
