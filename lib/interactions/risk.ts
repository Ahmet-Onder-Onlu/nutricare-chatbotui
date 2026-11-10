import type { Tables } from "@/supabase/types"

export type FoodInteraction = Tables<"food_interactions">
export type RiskLevel = "high" | "moderate" | "none"

export const RISK_META: Record<
  RiskLevel,
  {
    label: string
    short: string
    description: string
    badge: string
    card: string
    dot: string
    ring: string
  }
> = {
  high: {
    label: "Yüksek risk",
    short: "Kaçının",
    description:
      "Kaynak, birlikte kullanımdan kaçınılmasını veya yakın izlem gerektiğini belirtiyor.",
    badge:
      "bg-red-500/15 text-red-600 ring-1 ring-red-500/30 dark:text-red-300",
    card: "border-red-500/40 bg-red-500/[0.06] hover:border-red-500/70",
    dot: "bg-red-500",
    ring: "ring-red-500/40"
  },
  moderate: {
    label: "Orta risk",
    short: "Dikkat",
    description:
      "Etkileşim bildirilmiş; dikkatli olun ve sağlık uzmanınıza danışın.",
    badge:
      "bg-amber-400/20 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-200",
    card: "border-amber-400/50 bg-amber-400/[0.07] hover:border-amber-400/80",
    dot: "bg-amber-400",
    ring: "ring-amber-400/40"
  },
  none: {
    label: "Etkileşim kaydı yok",
    short: "Kayıt yok",
    description:
      "Bu kaynakta etkileşim kaydı yok. Bu, güvenli olduğu anlamına gelmez.",
    badge:
      "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300",
    card: "border-emerald-500/40 bg-emerald-500/[0.05] hover:border-emerald-500/70",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40"
  }
}

export const RISK_ORDER: RiskLevel[] = ["high", "moderate", "none"]

/** Boş, "X", "YOK", "yok" gibi yer tutucuları boş sayar. */
export function cleanField(value: string | null | undefined): string {
  const text = (value || "").trim()
  if (!text || /^(x|yok|-|—|n\/a)$/i.test(text)) return ""
  return text
}

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")

const HIGH_PATTERNS = [
  /kacin/, // kaçının, kaçınılmalı
  /almayin/,
  /kullanmayin/,
  /kullanilmamali/,
  /kontrendike/,
  /birlikte kullanim(i|indan)? onerilmez/,
  /onerilmez/,
  /oldurucu|olumcul|hayati/,
  /ciddi (kanama|toksisite|risk)/,
  /duzey takibi/,
  /konakion/ // K vitamini ile geri döndürme gerektiren kanama
]

/**
 * Kaynak metinde açık bir şiddet alanı yok; sınıflandırma, yönetim ve
 * mekanizma metnindeki ifadelere göre yapılır ve arayüzde bu şekilde belirtilir.
 */
export function classifyRisk(
  row: Pick<FoodInteraction, "interacting_drugs" | "management" | "mechanism">
): RiskLevel {
  const drugs = cleanField(row.interacting_drugs)
  const management = cleanField(row.management)
  const mechanism = cleanField(row.mechanism)
  if (!drugs && !mechanism && !management) return "none"
  const text = normalize(`${management} ${mechanism}`)
  if (HIGH_PATTERNS.some(pattern => pattern.test(text))) return "high"
  if (!drugs && !mechanism) return "none"
  return "moderate"
}

export function interactionTitle(row: FoodInteraction): string {
  const drugs = cleanField(row.interacting_drugs)
  if (!drugs) return row.food_name
  const firstLine = drugs.split(/\n|;/)[0].trim()
  const short = firstLine.length > 70 ? firstLine.slice(0, 67) + "…" : firstLine
  return `${row.food_name} × ${short}`
}

export function riskCounts(rows: FoodInteraction[]) {
  const counts: Record<RiskLevel, number> = { high: 0, moderate: 0, none: 0 }
  for (const row of rows) counts[classifyRisk(row)]++
  return counts
}

export function matchesText(value: string, query: string) {
  const term = normalize(query.trim())
  if (!term) return true
  return normalize(value).includes(term)
}

export { normalize as normalizeTr }
