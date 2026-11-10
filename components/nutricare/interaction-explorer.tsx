"use client"

import {
  classifyRisk,
  cleanField,
  FoodInteraction,
  matchesText,
  RISK_META,
  RISK_ORDER,
  RiskLevel,
  riskCounts
} from "@/lib/interactions/risk"
import { cn } from "@/lib/utils"
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconApple,
  IconBook,
  IconCircleCheck,
  IconFilter,
  IconPill,
  IconRefresh,
  IconSearch,
  IconX
} from "@tabler/icons-react"
import { FC, useMemo, useState } from "react"
import { InteractionCard, InteractionDialog } from "./interaction-card"

type Mode = "drug" | "food"
const PAGE = 12

const STAT_ITEMS = [
  {
    key: "total",
    label: "Toplam kayıt",
    Icon: IconBook,
    tone: "bg-blue-500/10 text-blue-500"
  },
  {
    key: "high",
    label: "Yüksek risk",
    Icon: IconAlertOctagon,
    tone: "bg-red-500/10 text-red-500"
  },
  {
    key: "moderate",
    label: "Orta risk",
    Icon: IconAlertTriangle,
    tone: "bg-amber-400/15 text-amber-500"
  },
  {
    key: "none",
    label: "Etkileşim kaydı yok",
    Icon: IconCircleCheck,
    tone: "bg-emerald-500/10 text-emerald-500"
  }
] as const

export const InteractionExplorer: FC<{
  rows: FoodInteraction[]
  loading: boolean
  error: string
  onRetry: () => void
  workspaceId: string
  personalIds?: Set<string>
}> = ({ rows, loading, error, onRetry, workspaceId, personalIds }) => {
  const [mode, setMode] = useState<Mode>("drug")
  const [query, setQuery] = useState("")
  const [food, setFood] = useState("")
  const [risk, setRisk] = useState<RiskLevel | "">("")
  const [onlyPersonal, setOnlyPersonal] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const [selected, setSelected] = useState<FoodInteraction | null>(null)

  const counts = useMemo(() => riskCounts(rows), [rows])
  const foods = useMemo(
    () =>
      [...new Set(rows.map(r => r.food_name))].sort((a, b) =>
        a.localeCompare(b, "tr")
      ),
    [rows]
  )

  const filtered = useMemo(() => {
    const result = rows.filter(row => {
      if (food && row.food_name !== food) return false
      if (risk && classifyRisk(row) !== risk) return false
      if (onlyPersonal && !personalIds?.has(row.id)) return false
      if (!query.trim()) return true
      return mode === "drug"
        ? matchesText(
            `${cleanField(row.interacting_drugs)} ${cleanField(row.mechanism)}`,
            query
          )
        : matchesText(
            `${row.food_name} ${row.latin_name} ${cleanField(row.active_ingredient)}`,
            query
          )
    })
    const rank = (row: FoodInteraction) =>
      (personalIds?.has(row.id) ? -10 : 0) +
      RISK_ORDER.indexOf(classifyRisk(row))
    return result.sort((a, b) => rank(a) - rank(b))
  }, [rows, food, risk, onlyPersonal, query, mode, personalIds])

  const hasFilters = Boolean(query || food || risk || onlyPersonal)
  const reset = () => {
    setQuery("")
    setFood("")
    setRisk("")
    setOnlyPersonal(false)
    setVisible(PAGE)
  }

  const statValue = (key: (typeof STAT_ITEMS)[number]["key"]) =>
    key === "total" ? rows.length : counts[key]

  return (
    <section
      id="etkilesimler"
      aria-labelledby="explorer-title"
      className="space-y-6"
    >
      <div className="bg-card nc-fade-up rounded-3xl border p-5 shadow-sm sm:p-6">
        <h2
          id="explorer-title"
          className="mb-5 text-center text-lg font-semibold"
        >
          Besin–İlaç Etkileşimi İstatistikleri
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STAT_ITEMS.map(({ key, label, Icon, tone }, i) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setRisk(key === "total" ? "" : key)
                setVisible(PAGE)
              }}
              className={cn(
                "nc-fade-up hover:bg-muted/60 flex flex-col items-center rounded-2xl p-3 transition-colors",
                (key === "total" ? !risk : risk === key) && "bg-muted/60"
              )}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className={cn(
                  "mb-2 flex size-11 items-center justify-center rounded-full",
                  tone
                )}
              >
                <Icon size={22} />
              </span>
              <span className="text-2xl font-bold tabular-nums">
                {loading ? (
                  <span className="nc-skeleton inline-block h-7 w-10 rounded" />
                ) : (
                  statValue(key)
                )}
              </span>
              <span className="text-muted-foreground text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card nc-fade-up nc-delay-1 rounded-3xl border p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <IconFilter size={18} className="text-primary" /> Arama ve filtre
          </h3>
          <div
            role="tablist"
            aria-label="Arama türü"
            className="bg-muted inline-flex rounded-xl p-1"
          >
            {(
              [
                ["drug", "İlaç seç", IconPill],
                ["food", "Besin seç", IconApple]
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
                  mode === value
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
          <label className="relative block">
            <span className="sr-only">
              {mode === "drug" ? "İlaç adına göre ara" : "Besin adına göre ara"}
            </span>
            <IconSearch
              size={18}
              className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setVisible(PAGE)
              }}
              placeholder={
                mode === "drug"
                  ? "İlaç veya ilaç grubu ara (ör. varfarin, statin)…"
                  : "Besin veya bitki ara (ör. greyfurt, ginkgo)…"
              }
              className="bg-background focus:ring-ring/30 h-11 w-full rounded-xl border pl-10 pr-9 text-sm outline-none transition-shadow focus:ring-4"
            />
            {query && (
              <button
                type="button"
                aria-label="Aramayı temizle"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 p-1"
              >
                <IconX size={16} />
              </button>
            )}
          </label>
          <select
            aria-label="Besin filtresi"
            value={food}
            onChange={e => {
              setFood(e.target.value)
              setVisible(PAGE)
            }}
            className="bg-background focus:ring-ring/30 h-11 rounded-xl border px-3 text-sm outline-none focus:ring-4"
          >
            <option value="">Tüm besinler</option>
            {foods.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Risk düzeyi filtresi"
            value={risk}
            onChange={e => {
              setRisk(e.target.value as RiskLevel | "")
              setVisible(PAGE)
            }}
            className="bg-background focus:ring-ring/30 h-11 rounded-xl border px-3 text-sm outline-none focus:ring-4"
          >
            <option value="">Tüm risk düzeyleri</option>
            {RISK_ORDER.map(level => (
              <option key={level} value={level}>
                {RISK_META[level].label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {RISK_ORDER.map(level => (
            <span
              key={level}
              className="text-muted-foreground inline-flex items-center gap-1.5"
            >
              <span
                className={cn("size-2.5 rounded-full", RISK_META[level].dot)}
              />
              {RISK_META[level].label}
            </span>
          ))}
          {personalIds && personalIds.size > 0 && (
            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={onlyPersonal}
                onChange={e => setOnlyPersonal(e.target.checked)}
                className="accent-primary size-4"
              />
              Yalnızca profilimle ilgili ({personalIds.size})
            </label>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold">
          Etkileşim sonuçları{" "}
          <span className="text-muted-foreground text-sm font-normal">
            ({filtered.length} bulundu)
          </span>
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="text-primary inline-flex items-center gap-1 text-sm font-medium"
          >
            <IconRefresh size={16} /> Filtreleri temizle
          </button>
        )}
      </div>
      <p className="text-muted-foreground -mt-4 text-sm">
        Riskler ve öneriler hakkında ayrıntı için bir karta tıklayın.
      </p>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm"
        >
          {error}{" "}
          <button className="font-semibold underline" onClick={onRetry}>
            Tekrar dene
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="nc-skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border p-8 text-center">
          <p className="font-semibold">Eşleşen kayıt bulunamadı.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Kayıt olmaması etkileşim olmadığı anlamına gelmez. Asistana sormayı
            deneyin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visible).map((row, index) => (
              <InteractionCard
                key={row.id}
                row={row}
                index={index % PAGE}
                onOpen={setSelected}
                highlight={personalIds?.has(row.id)}
              />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisible(v => v + PAGE)}
                className="bg-card hover:bg-muted rounded-xl border px-5 py-2 text-sm font-semibold transition-colors"
              >
                Daha fazla göster ({filtered.length - visible})
              </button>
            </div>
          )}
        </>
      )}

      <InteractionDialog
        row={selected}
        workspaceId={workspaceId}
        onClose={() => setSelected(null)}
      />
    </section>
  )
}
