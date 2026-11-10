"use client"

import { ChatbotUIContext } from "@/context/context"
import { updateProfile } from "@/db/profile"
import {
  ALLERGY_SUGGESTIONS,
  bmi,
  bmiLabel,
  CONDITION_OPTIONS,
  EMPTY_PROFILE,
  Goal,
  GOAL_LABELS,
  HealthProfile,
  MEDICATION_SUGGESTIONS,
  parseProfile,
  sanitizeProfile,
  serializeProfile,
  Sex
} from "@/lib/health-profile"
import { cn } from "@/lib/utils"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconHeartbeat,
  IconLock,
  IconPill,
  IconPlus,
  IconTarget,
  IconUser,
  IconX
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { FC, KeyboardEvent, useContext, useState } from "react"
import { toast } from "sonner"

const STEPS = [
  { id: "basic", title: "Temel bilgiler", Icon: IconUser },
  { id: "health", title: "Sağlık durumu", Icon: IconHeartbeat },
  { id: "meds", title: "İlaç ve alerjiler", Icon: IconPill },
  { id: "goals", title: "Hedefler", Icon: IconTarget }
] as const

const Chip: FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-all",
      active
        ? "border-primary bg-primary text-primary-foreground scale-[1.03] shadow"
        : "hover:border-primary/60 hover:bg-primary/5"
    )}
  >
    {active && <IconCheck size={14} />}
    {children}
  </button>
)

const TagInput: FC<{
  label: string
  values: string[]
  onChange: (values: string[]) => void
  suggestions: string[]
  placeholder: string
}> = ({ label, values, onChange, suggestions, placeholder }) => {
  const [draft, setDraft] = useState("")
  const add = (value: string) => {
    const v = value.trim().slice(0, 60)
    if (
      !v ||
      values.some(x => x.toLocaleLowerCase("tr") === v.toLocaleLowerCase("tr"))
    )
      return setDraft("")
    onChange([...values, v].slice(0, 12))
    setDraft("")
  }
  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      add(draft)
    }
    if (event.key === "Backspace" && !draft && values.length)
      onChange(values.slice(0, -1))
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="bg-background focus-within:ring-ring/30 flex flex-wrap items-center gap-1.5 rounded-xl border p-2 focus-within:ring-4">
        {values.map(value => (
          <span
            key={value}
            className="nc-pop bg-primary/10 text-primary inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium"
          >
            {value}
            <button
              type="button"
              aria-label={`${value} kaldır`}
              onClick={() => onChange(values.filter(v => v !== value))}
            >
              <IconX size={14} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => add(draft)}
          placeholder={values.length ? "" : placeholder}
          aria-label={label}
          className="min-w-[140px] flex-1 bg-transparent p-1 text-sm outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions
          .filter(s => !values.includes(s))
          .slice(0, 8)
          .map(s => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-muted-foreground hover:border-primary hover:text-foreground inline-flex items-center gap-0.5 rounded-full border border-dashed px-2.5 py-1 text-xs transition-colors"
            >
              <IconPlus size={12} /> {s}
            </button>
          ))}
      </div>
    </div>
  )
}

const NumberField: FC<{
  id: string
  label: string
  unit: string
  value: number | null
  min: number
  max: number
  onChange: (value: number | null) => void
}> = ({ id, label, unit, value, min, max, onChange }) => (
  <label htmlFor={id} className="space-y-1.5">
    <span className="text-sm font-semibold">{label}</span>
    <span className="bg-background focus-within:ring-ring/30 flex items-center rounded-xl border pr-3 focus-within:ring-4">
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={e =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="h-11 w-full min-w-0 bg-transparent px-3 text-sm outline-none"
      />
      <span className="text-muted-foreground text-sm">{unit}</span>
    </span>
  </label>
)

export const HealthProfileWizard: FC<{ workspaceId: string }> = ({
  workspaceId
}) => {
  const router = useRouter()
  const { profile, setProfile } = useContext(ChatbotUIContext)
  const [data, setData] = useState<HealthProfile>(
    () => parseProfile(profile?.profile_context) || EMPTY_PROFILE
  )
  const [step, setStep] = useState(0)
  const [consent, setConsent] = useState(
    Boolean(parseProfile(profile?.profile_context))
  )
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof HealthProfile>(
    key: K,
    value: HealthProfile[K]
  ) => setData(current => ({ ...current, [key]: value }))
  const toggle = (key: "conditions" | "goals", value: string) =>
    setData(current => {
      const list = current[key] as string[]
      return {
        ...current,
        [key]: list.includes(value)
          ? list.filter(v => v !== value)
          : [...list, value]
      }
    })

  const canContinue =
    step === 0
      ? Boolean(data.sex && data.age && data.age > 0 && data.age <= 120)
      : true
  const bmiValue = bmi(data)
  const isLast = step === STEPS.length - 1

  const save = async () => {
    if (!profile) return
    if (!consent)
      return toast.error(
        "Devam etmek için profil bilgilerinizin saklanmasını onaylayın."
      )
    setSaving(true)
    try {
      const clean = sanitizeProfile({
        ...data,
        updatedAt: new Date().toISOString()
      })
      const updated = await updateProfile(profile.id, {
        profile_context: serializeProfile(clean)
      })
      setProfile(updated)
      toast.success("Sağlık profiliniz kaydedildi. Öneriler kişiselleştirildi.")
      router.push(`/${workspaceId}`)
    } catch {
      toast.error("Profil kaydedilemedi. Lütfen tekrar deneyin.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Anket adımları">
        {STEPS.map(({ id, title, Icon }, index) => (
          <li key={id} className="flex flex-col items-center gap-2 text-center">
            <button
              type="button"
              onClick={() => (index <= step || canContinue) && setStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl border-2 transition-all duration-300",
                index < step && "border-emerald-500 bg-emerald-500 text-white",
                index === step &&
                  "border-primary bg-primary text-primary-foreground scale-110 shadow-lg shadow-blue-500/30",
                index > step && "text-muted-foreground"
              )}
            >
              {index < step ? <IconCheck size={20} /> : <Icon size={20} />}
            </button>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                index === step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {title}
            </span>
          </li>
        ))}
      </ol>
      <div className="bg-muted mb-6 h-1.5 overflow-hidden rounded-full">
        <div
          className="nc-gradient-bg h-full rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div
        key={step}
        className="nc-fade-up bg-card space-y-6 rounded-3xl border p-5 shadow-sm sm:p-8"
      >
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-wider">
            Adım {step + 1} / {STEPS.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{STEPS[step].title}</h2>
        </div>

        {step === 0 && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Cinsiyet</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["kadin", "Kadın"],
                    ["erkek", "Erkek"],
                    ["belirtmek-istemiyorum", "Belirtmek istemiyorum"]
                  ] as [Sex, string][]
                ).map(([value, label]) => (
                  <Chip
                    key={value}
                    active={data.sex === value}
                    onClick={() => set("sex", value)}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                id="age"
                label="Yaş"
                unit="yıl"
                min={1}
                max={120}
                value={data.age}
                onChange={v => set("age", v)}
              />
              <NumberField
                id="height"
                label="Boy"
                unit="cm"
                min={40}
                max={250}
                value={data.heightCm}
                onChange={v => set("heightCm", v)}
              />
              <NumberField
                id="weight"
                label="Kilo"
                unit="kg"
                min={2}
                max={400}
                value={data.weightKg}
                onChange={v => set("weightKg", v)}
              />
            </div>
            {bmiValue && bmiValue > 8 && bmiValue < 80 && (
              <div className="nc-pop bg-primary/5 flex items-center justify-between rounded-2xl border p-4">
                <span className="text-sm">Vücut kitle indeksi</span>
                <span className="text-lg font-bold">
                  {bmiValue}{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    ({bmiLabel(bmiValue)})
                  </span>
                </span>
              </div>
            )}
            {data.sex === "kadin" && (
              <label className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.pregnancy}
                  onChange={e => set("pregnancy", e.target.checked)}
                  className="accent-primary size-4"
                />
                Gebeyim veya emziriyorum
              </label>
            )}
          </>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Aktif olarak takip edilen hastalıklarınızı seçin (birden fazla
              seçebilirsiniz).
            </p>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map(condition => (
                <Chip
                  key={condition}
                  active={data.conditions.includes(condition)}
                  onClick={() => toggle("conditions", condition)}
                >
                  {condition}
                </Chip>
              ))}
            </div>
            <TagInput
              label="Listede olmayan bir hastalık"
              values={data.conditions.filter(
                c => !CONDITION_OPTIONS.includes(c)
              )}
              onChange={extra =>
                set("conditions", [
                  ...data.conditions.filter(c => CONDITION_OPTIONS.includes(c)),
                  ...extra
                ])
              }
              suggestions={[]}
              placeholder="Yazıp Enter'a basın"
            />
          </div>
        )}

        {step === 2 && (
          <>
            <TagInput
              label="Düzenli kullandığınız ilaçlar"
              values={data.medications}
              onChange={v => set("medications", v)}
              suggestions={MEDICATION_SUGGESTIONS}
              placeholder="ör. Varfarin — yazıp Enter'a basın"
            />
            <TagInput
              label="Vitamin / bitkisel takviyeler"
              values={data.supplements}
              onChange={v => set("supplements", v)}
              suggestions={[
                "Ginkgo biloba",
                "Sarı kantaron",
                "Omega-3",
                "D vitamini",
                "Zencefil"
              ]}
              placeholder="ör. Ginkgo biloba"
            />
            <TagInput
              label="Alerjiler"
              values={data.allergies}
              onChange={v => set("allergies", v)}
              suggestions={ALLERGY_SUGGESTIONS}
              placeholder="ör. Fıstık"
            />
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid gap-2">
              {(Object.keys(GOAL_LABELS) as Goal[]).map(goal => (
                <button
                  key={goal}
                  type="button"
                  aria-pressed={data.goals.includes(goal)}
                  onClick={() => toggle("goals", goal)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all",
                    data.goals.includes(goal)
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  )}
                >
                  {GOAL_LABELS[goal]}
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border transition-all",
                      data.goals.includes(goal) &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {data.goals.includes(goal) && <IconCheck size={13} />}
                  </span>
                </button>
              ))}
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">
                Eklemek istedikleriniz (isteğe bağlı)
              </span>
              <textarea
                value={data.notes}
                maxLength={200}
                onChange={e => set("notes", e.target.value)}
                rows={2}
                className="bg-background focus:ring-ring/30 w-full rounded-xl border p-3 text-sm outline-none focus:ring-4"
                placeholder="ör. Vejetaryenim, akşamları kahve içiyorum…"
              />
            </label>
            <label className="bg-muted/50 flex gap-3 rounded-2xl border p-4 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="accent-primary mt-0.5 size-4 shrink-0"
              />
              <span>
                <span className="flex items-center gap-1 font-semibold">
                  <IconLock size={14} /> Bilgilerimin hesabımda saklanmasını
                  onaylıyorum
                </span>
                <span className="text-muted-foreground text-xs">
                  Yalnızca size gösterilen önerileri ve asistan yanıtlarını
                  kişiselleştirmek için kullanılır; yalnızca siz görebilirsiniz.
                  İstediğiniz zaman güncelleyebilir veya silebilirsiniz.
                </span>
              </span>
            </label>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() =>
              step === 0 ? router.push(`/${workspaceId}`) : setStep(s => s - 1)
            }
            className="hover:bg-muted inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            <IconArrowLeft size={16} /> {step === 0 ? "Şimdilik atla" : "Geri"}
          </button>
          <button
            type="button"
            disabled={!canContinue || saving || (isLast && !consent)}
            onClick={() => (isLast ? save() : setStep(s => s + 1))}
            className="nc-gradient-bg inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
          >
            {isLast ? (saving ? "Kaydediliyor…" : "Profili kaydet") : "Devam"}
            {!isLast && <IconArrowRight size={16} />}
          </button>
        </div>
        {step === 0 && !canContinue && (
          <p className="text-muted-foreground -mt-3 text-right text-xs">
            Devam etmek için cinsiyet ve yaş bilgisini girin.
          </p>
        )}
      </div>
    </div>
  )
}
