import {
  cleanField,
  FoodInteraction,
  normalizeTr
} from "@/lib/interactions/risk"

/**
 * Sağlık profili, kullanıcının kendi `profiles.profile_context` alanında
 * (yalnızca sahibinin okuyabildiği RLS korumalı satır) saklanır. Alan 1500
 * karakterle sınırlıdır; serileştirme bu sınırı aşmayacak şekilde kırpar.
 */
export const PROFILE_MARKER = "[NutriCare sağlık profili v1]"
export const PROFILE_CONTEXT_LIMIT = 1500

export type Sex = "kadin" | "erkek" | "belirtmek-istemiyorum" | ""
export type Goal =
  | "etkilesim-kontrolu"
  | "kilo-yonetimi"
  | "kronik-hastalik"
  | "gebelik-emzirme"
  | "genel-saglik"

export interface HealthProfile {
  sex: Sex
  age: number | null
  heightCm: number | null
  weightKg: number | null
  conditions: string[]
  medications: string[]
  allergies: string[]
  supplements: string[]
  pregnancy: boolean
  goals: Goal[]
  notes: string
  updatedAt: string
}

export const EMPTY_PROFILE: HealthProfile = {
  sex: "",
  age: null,
  heightCm: null,
  weightKg: null,
  conditions: [],
  medications: [],
  allergies: [],
  supplements: [],
  pregnancy: false,
  goals: [],
  notes: "",
  updatedAt: ""
}

export const CONDITION_OPTIONS = [
  "Hipertansiyon",
  "Diyabet",
  "Kalp yetmezliği",
  "Koroner arter hastalığı",
  "Atriyal fibrilasyon",
  "Böbrek hastalığı",
  "Karaciğer hastalığı",
  "Tiroid hastalığı",
  "Depresyon / anksiyete",
  "Epilepsi",
  "Astım / KOAH",
  "Kanser tedavisi",
  "Organ nakli"
]

export const MEDICATION_SUGGESTIONS = [
  "Varfarin",
  "Simvastatin",
  "Atorvastatin",
  "Metformin",
  "Levotiroksin",
  "Lisinopril",
  "Siprofloksasin",
  "Lityum",
  "Aspirin",
  "Klopidogrel",
  "Digoksin",
  "Takrolimus",
  "Sertralin"
]

export const ALLERGY_SUGGESTIONS = [
  "Fıstık",
  "Süt",
  "Yumurta",
  "Gluten",
  "Deniz ürünleri",
  "Penisilin",
  "Sülfonamid"
]

export const GOAL_LABELS: Record<Goal, string> = {
  "etkilesim-kontrolu": "İlaç–besin etkileşimlerimi takip etmek",
  "kilo-yonetimi": "Kilo yönetimi",
  "kronik-hastalik": "Kronik hastalığımla uyumlu beslenmek",
  "gebelik-emzirme": "Gebelik / emzirme döneminde güvenli beslenmek",
  "genel-saglik": "Genel sağlıklı yaşam"
}

const clip = (value: string, max: number) => value.trim().slice(0, max)
const list = (values: unknown, maxItems = 12, maxLength = 60) =>
  Array.isArray(values)
    ? [
        ...new Set(
          values
            .filter((v): v is string => typeof v === "string")
            .map(v => clip(v, maxLength))
            .filter(Boolean)
        )
      ].slice(0, maxItems)
    : []
const num = (value: unknown, min: number, max: number) => {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : null
}

export function sanitizeProfile(input: Partial<HealthProfile>): HealthProfile {
  const sex: Sex = ["kadin", "erkek", "belirtmek-istemiyorum"].includes(
    input.sex as string
  )
    ? (input.sex as Sex)
    : ""
  return {
    sex,
    age: num(input.age, 1, 120),
    heightCm: num(input.heightCm, 40, 250),
    weightKg: num(input.weightKg, 2, 400),
    conditions: list(input.conditions),
    medications: list(input.medications),
    allergies: list(input.allergies),
    supplements: list(input.supplements, 8),
    pregnancy: sex === "kadin" && Boolean(input.pregnancy),
    goals: list(input.goals, 5).filter((g): g is Goal => g in GOAL_LABELS),
    notes: clip(String(input.notes || ""), 200),
    updatedAt: String(input.updatedAt || "").slice(0, 30)
  }
}

/** Yapay zekâya ve veritabanına giden metin; 1500 karakteri asla aşmaz. */
export function serializeProfile(profile: HealthProfile): string {
  let data = sanitizeProfile(profile)
  let text = `${PROFILE_MARKER}\n${JSON.stringify(data)}`
  // Sınırı aşarsa önce notları, sonra liste uzunluklarını azalt.
  const shrinkers: ((p: HealthProfile) => HealthProfile)[] = [
    p => ({ ...p, notes: "" }),
    p => ({ ...p, supplements: p.supplements.slice(0, 3) }),
    p => ({
      ...p,
      conditions: p.conditions.slice(0, 6),
      allergies: p.allergies.slice(0, 6)
    }),
    p => ({ ...p, medications: p.medications.slice(0, 8) })
  ]
  for (const shrink of shrinkers) {
    if (text.length <= PROFILE_CONTEXT_LIMIT) break
    data = shrink(data)
    text = `${PROFILE_MARKER}\n${JSON.stringify(data)}`
  }
  return text.slice(0, PROFILE_CONTEXT_LIMIT)
}

export function parseProfile(
  context: string | null | undefined
): HealthProfile | null {
  if (!context || !context.startsWith(PROFILE_MARKER)) return null
  try {
    return sanitizeProfile(JSON.parse(context.slice(PROFILE_MARKER.length)))
  } catch {
    return null
  }
}

export function isProfileComplete(profile: HealthProfile | null): boolean {
  return Boolean(profile && profile.updatedAt && profile.age && profile.sex)
}

export function bmi(profile: HealthProfile): number | null {
  if (!profile.heightCm || !profile.weightKg) return null
  const m = profile.heightCm / 100
  return Math.round((profile.weightKg / (m * m)) * 10) / 10
}

export function bmiLabel(value: number): string {
  if (value < 18.5) return "Zayıf"
  if (value < 25) return "Normal"
  if (value < 30) return "Fazla kilolu"
  return "Obez"
}

/** Sohbet modeline giden okunur özet (sunucuda kullanılır). */
export function profilePromptSummary(profile: HealthProfile): string {
  const parts = [
    profile.sex &&
      `Cinsiyet: ${profile.sex === "kadin" ? "kadın" : profile.sex === "erkek" ? "erkek" : "belirtilmedi"}`,
    profile.age && `Yaş: ${profile.age}`,
    profile.heightCm &&
      profile.weightKg &&
      `Boy/kilo: ${profile.heightCm} cm / ${profile.weightKg} kg`,
    profile.pregnancy && "Gebelik/emzirme: evet",
    profile.conditions.length &&
      `Hastalıklar: ${profile.conditions.join(", ")}`,
    profile.medications.length &&
      `Kullandığı ilaçlar: ${profile.medications.join(", ")}`,
    profile.supplements.length &&
      `Takviyeler: ${profile.supplements.join(", ")}`,
    profile.allergies.length && `Alerjiler: ${profile.allergies.join(", ")}`,
    profile.goals.length &&
      `Hedefler: ${profile.goals.map(g => GOAL_LABELS[g]).join(", ")}`
  ].filter(Boolean)
  return parts.join("\n")
}

/**
 * Profildeki ilaç/takviye/alerji adlarının etkileşim kayıtlarında geçtiği
 * satırları döndürür. İlaç sınıfları için yaygın eşleştirmeler eklenmiştir.
 */
const DRUG_CLASS_HINTS: Record<string, string[]> = {
  varfarin: ["kan sulandirici", "antikoagulan", "warfarin"],
  warfarin: ["kan sulandirici", "antikoagulan", "varfarin"],
  aspirin: ["antiplatelet", "kan sulandirici", "asetilsalisilik"],
  klopidogrel: ["antiplatelet", "kan sulandirici"],
  simvastatin: ["statin"],
  atorvastatin: ["statin"],
  rosuvastatin: ["statin"],
  metformin: ["antidiyabetik", "diyabet", "kan sekeri"],
  insulin: ["antidiyabetik", "diyabet", "kan sekeri"],
  lisinopril: ["ace inhibit", "antihipertansif", "tansiyon"],
  ramipril: ["ace inhibit", "antihipertansif", "tansiyon"],
  amlodipin: ["kalsiyum kanal", "antihipertansif", "tansiyon"],
  siprofloksasin: ["kinolon", "antibiyotik"],
  sertralin: ["ssri", "antidepresan", "serotonin"],
  fluoksetin: ["ssri", "antidepresan", "serotonin"],
  lityum: ["lityum"],
  takrolimus: ["immunsupresif", "immunosupresan"],
  siklosporin: ["immunsupresif", "immunosupresan"],
  digoksin: ["digoksin", "kardiyak glikozit"],
  levotiroksin: ["tiroid"]
}

export function personalTerms(profile: HealthProfile): string[] {
  const base = [...profile.medications, ...profile.supplements].map(v =>
    normalizeTr(v).trim()
  )
  const terms = new Set<string>()
  for (const term of base) {
    if (term.length < 3) continue
    terms.add(term)
    for (const hint of DRUG_CLASS_HINTS[term] || []) terms.add(hint)
  }
  return [...terms]
}

export function personalMatches(
  rows: FoodInteraction[],
  profile: HealthProfile | null
): FoodInteraction[] {
  if (!profile) return []
  const terms = personalTerms(profile)
  if (!terms.length) return []
  return rows.filter(row => {
    const haystack = normalizeTr(
      `${cleanField(row.interacting_drugs)} ${cleanField(row.mechanism)}`
    )
    return terms.some(term => haystack.includes(term))
  })
}

export function allergyMatches(
  rows: FoodInteraction[],
  profile: HealthProfile | null
): FoodInteraction[] {
  if (!profile?.allergies.length) return []
  const terms = profile.allergies
    .map(a => normalizeTr(a))
    .filter(a => a.length >= 3)
  return rows.filter(row =>
    terms.some(term =>
      normalizeTr(`${row.food_name} ${row.latin_name}`).includes(term)
    )
  )
}
