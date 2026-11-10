"use client"

import type { NewsItem } from "@/lib/news/rss"
import { cn } from "@/lib/utils"
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBroadcast,
  IconExternalLink,
  IconLanguage
} from "@tabler/icons-react"
import { FC, useEffect, useState } from "react"

interface NewsResponse {
  items: NewsItem[]
  sources: { id: string; name: string; homepage: string; ok: boolean }[]
  fetchedAt: string
}

const OFFICIAL_LINKS = [
  {
    name: "TİTCK Duyuruları",
    description: "Türkiye İlaç ve Tıbbi Cihaz Kurumu güncel duyuruları",
    href: "https://www.titck.gov.tr/duyuru"
  },
  {
    name: "TİTCK Farmakovijilans",
    description: "Advers etki bildirimi ve güvenlik bilgileri",
    href: "https://www.titck.gov.tr/faaliyetalanlari/ilac/farmakovijilans"
  },
  {
    name: "FDA Drug Safety",
    description: "ABD ilaç güvenliği iletişimleri",
    href: "https://www.fda.gov/drugs/drug-safety-and-availability"
  }
]

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric"
})

export const NewsFeed: FC<{ limit?: number }> = ({ limit = 6 }) => {
  const [data, setData] = useState<NewsResponse | null>(null)
  const [failed, setFailed] = useState(false)
  const [onlyCritical, setOnlyCritical] = useState(false)

  useEffect(() => {
    let active = true
    fetch("/api/news")
      .then(response => {
        if (!response.ok) throw new Error()
        return response.json()
      })
      .then(json => active && setData(json))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [])

  const items = (data?.items || []).filter(
    item => !onlyCritical || item.critical
  )

  return (
    <section
      id="haberler"
      aria-labelledby="news-title"
      className="bg-card nc-fade-up rounded-3xl border p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="news-title"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
            </span>
            Güncel ilaç güvenliği haberleri
          </h2>
          <p className="text-muted-foreground text-xs">
            Resmî kurum yayınlarından saatlik olarak derlenir.
            {data?.fetchedAt &&
              ` Son güncelleme: ${new Date(data.fetchedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            checked={onlyCritical}
            onChange={e => setOnlyCritical(e.target.checked)}
            className="size-4 accent-red-500"
          />
          Yalnızca kritik
        </label>
      </div>

      {!data && !failed && (
        <ul className="space-y-3">
          {[0, 1, 2].map(i => (
            <li key={i} className="nc-skeleton h-16 rounded-xl" />
          ))}
        </ul>
      )}

      {(failed || (data && !data.items.length)) && (
        <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          Haber kaynaklarına şu anda ulaşılamadı. Aşağıdaki resmî bağlantılardan
          güncel duyurulara ulaşabilirsiniz.
        </p>
      )}

      {data && items.length > 0 && (
        <ul className="divide-y">
          {items.slice(0, limit).map((item, index) => (
            <li
              key={item.id}
              className="nc-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-muted/60 group -mx-2 flex gap-3 rounded-xl px-2 py-3 transition-colors"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                    item.critical
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  )}
                >
                  {item.critical ? (
                    <IconAlertTriangle size={18} />
                  ) : (
                    <IconBroadcast size={18} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {item.critical && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-semibold text-red-600 dark:text-red-300">
                        Kritik
                      </span>
                    )}
                    <span className="text-muted-foreground font-medium">
                      {item.source}
                    </span>
                    {item.publishedAt && (
                      <span className="text-muted-foreground">
                        · {dateFormatter.format(new Date(item.publishedAt))}
                      </span>
                    )}
                    {item.language === "en" && (
                      <span className="text-muted-foreground inline-flex items-center gap-0.5">
                        · <IconLanguage size={12} /> İngilizce
                      </span>
                    )}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium group-hover:underline">
                    {item.title}
                  </span>
                </span>
                <IconExternalLink
                  size={16}
                  className="text-muted-foreground mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {OFFICIAL_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-muted/50 hover:bg-muted group rounded-xl p-3 transition-colors"
          >
            <span className="flex items-center justify-between text-sm font-semibold">
              {link.name}
              <IconArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
            <span className="text-muted-foreground text-xs">
              {link.description}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
