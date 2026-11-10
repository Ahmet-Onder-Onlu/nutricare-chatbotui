"use client"

import {
  allergyMatches,
  bmi,
  bmiLabel,
  HealthProfile,
  isProfileComplete,
  personalMatches
} from "@/lib/health-profile"
import {
  classifyRisk,
  FoodInteraction,
  interactionTitle,
  RISK_META
} from "@/lib/interactions/risk"
import { cn } from "@/lib/utils"
import {
  IconArrowRight,
  IconClipboardHeart,
  IconEdit,
  IconSparkles
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, useMemo } from "react"
import { RiskBadge } from "./risk-badge"

export const ProfileCallToAction: FC<{ workspaceId: string }> = ({
  workspaceId
}) => (
  <section className="nc-fade-up relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10 p-6 sm:p-8">
    <div className="nc-blob pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-blue-500/20 blur-3xl" />
    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
      <span className="nc-float bg-primary/15 text-primary flex size-16 shrink-0 items-center justify-center rounded-2xl">
        <IconClipboardHeart size={34} />
      </span>
      <div className="flex-1">
        <p className="text-primary mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
          <IconSparkles size={14} /> 3–5 dakika
        </p>
        <h2 className="text-xl font-bold sm:text-2xl">
          Önce sizi tanıyalım: sağlık profilinizi oluşturun
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Yaş, kilo, hastalıklar, kullandığınız ilaçlar ve alerjileriniz
          hakkında birkaç soru. Ardından size özel riskli kombinasyonları öne
          çıkarır, asistan yanıtlarını profilinize göre uyarlarız.
        </p>
      </div>
      <Link
        href={`/${workspaceId}/profile`}
        className="nc-gradient-bg inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.03]"
      >
        Ankete başla <IconArrowRight size={16} />
      </Link>
    </div>
  </section>
)

export const ProfileOverview: FC<{
  profile: HealthProfile
  rows: FoodInteraction[]
  workspaceId: string
  onOpen: (row: FoodInteraction) => void
}> = ({ profile, rows, workspaceId, onOpen }) => {
  const matches = useMemo(
    () =>
      personalMatches(rows, profile).sort(
        (a, b) =>
          ["high", "moderate", "none"].indexOf(classifyRisk(a)) -
          ["high", "moderate", "none"].indexOf(classifyRisk(b))
      ),
    [rows, profile]
  )
  const allergyRows = useMemo(
    () => allergyMatches(rows, profile),
    [rows, profile]
  )
  const bmiValue = bmi(profile)
  const highCount = matches.filter(r => classifyRisk(r) === "high").length

  if (!isProfileComplete(profile))
    return <ProfileCallToAction workspaceId={workspaceId} />

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="bg-card nc-fade-up rounded-3xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Sağlık profilim</h2>
          <Link
            href={`/${workspaceId}/profile`}
            className="text-primary inline-flex items-center gap-1 text-xs font-medium"
          >
            <IconEdit size={14} /> Düzenle
          </Link>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/60 rounded-2xl p-3">
            <dt className="text-muted-foreground text-[11px]">Yaş</dt>
            <dd className="text-lg font-bold">{profile.age}</dd>
          </div>
          <div className="bg-muted/60 rounded-2xl p-3">
            <dt className="text-muted-foreground text-[11px]">Kilo</dt>
            <dd className="text-lg font-bold">{profile.weightKg ?? "—"}</dd>
          </div>
          <div className="bg-muted/60 rounded-2xl p-3">
            <dt className="text-muted-foreground text-[11px]">VKİ</dt>
            <dd className="text-lg font-bold">{bmiValue ?? "—"}</dd>
          </div>
        </dl>
        {bmiValue && (
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Vücut kitle indeksi: {bmiLabel(bmiValue)}
          </p>
        )}
        {(
          [
            [
              "İlaçlar",
              profile.medications,
              "bg-blue-500/10 text-blue-600 dark:text-blue-300"
            ],
            [
              "Hastalıklar",
              profile.conditions,
              "bg-violet-500/10 text-violet-600 dark:text-violet-300"
            ],
            [
              "Alerjiler",
              profile.allergies,
              "bg-rose-500/10 text-rose-600 dark:text-rose-300"
            ]
          ] as const
        ).map(([label, values, tone]) => (
          <div key={label} className="mt-4">
            <p className="text-muted-foreground mb-1.5 text-xs font-semibold">
              {label}
            </p>
            <div className="flex flex-wrap gap-1">
              {values.length ? (
                values.map(value => (
                  <span
                    key={value}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      tone
                    )}
                  >
                    {value}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">
                  Belirtilmedi
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card nc-fade-up nc-delay-1 rounded-3xl border p-5 shadow-sm">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">
            Size özel dikkat edilmesi gerekenler
          </h2>
          {highCount > 0 && (
            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-300">
              {highCount} yüksek riskli kayıt
            </span>
          )}
        </div>
        <p className="text-muted-foreground mb-4 text-xs">
          Profilinizdeki ilaç ve takviyelerle eşleşen kaynak kayıtları.
        </p>
        {profile.medications.length + profile.supplements.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
            Profilinize ilaç veya takviye eklerseniz ilgili etkileşimleri burada
            görürsünüz.
          </p>
        ) : matches.length === 0 && allergyRows.length === 0 ? (
          <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm">
            Profilinizdeki ilaçlar için veri tabanında eşleşen etkileşim kaydı
            bulunamadı. Bu, etkileşim olmadığı anlamına gelmez; şüphede asistana
            veya eczacınıza danışın.
          </p>
        ) : (
          <ul className="space-y-2">
            {[
              ...allergyRows.map(row => ({ row, allergy: true })),
              ...matches.map(row => ({ row, allergy: false }))
            ]
              .slice(0, 6)
              .map(({ row, allergy }, index) => {
                const level = allergy ? "high" : classifyRisk(row)
                return (
                  <li
                    key={`${allergy}-${row.id}`}
                    className="nc-fade-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(row)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                        RISK_META[level].card
                      )}
                    >
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          RISK_META[level].dot
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm font-semibold">
                          {allergy
                            ? `${row.food_name} — alerji listenizde`
                            : interactionTitle(row)}
                        </span>
                      </span>
                      <RiskBadge level={level} variant="short" />
                    </button>
                  </li>
                )
              })}
          </ul>
        )}
      </div>
    </section>
  )
}
