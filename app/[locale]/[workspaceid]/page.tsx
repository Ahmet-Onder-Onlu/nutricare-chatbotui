"use client"

import { AppHeader } from "@/components/nutricare/app-header"
import { AssistantLauncher } from "@/components/nutricare/assistant-launcher"
import { InteractionDialog } from "@/components/nutricare/interaction-card"
import { InteractionExplorer } from "@/components/nutricare/interaction-explorer"
import { NewsFeed } from "@/components/nutricare/news-feed"
import {
  ProfileCallToAction,
  ProfileOverview
} from "@/components/nutricare/profile-summary"
import { SafetyReminders } from "@/components/nutricare/safety-reminders"
import { ChatbotUIContext } from "@/context/context"
import { parseProfile, personalMatches } from "@/lib/health-profile"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { FoodInteraction } from "@/lib/interactions/risk"
import {
  IconHeartHandshake,
  IconInfoCircle,
  IconPill
} from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { useContext, useMemo, useState } from "react"

function greeting() {
  const hour = new Date().getHours()
  if (hour < 6) return "İyi geceler"
  if (hour < 12) return "Günaydın"
  if (hour < 18) return "İyi günler"
  return "İyi akşamlar"
}

export default function WorkspaceHomePage() {
  const params = useParams()
  const workspaceId = String(params.workspaceid)
  const { profile } = useContext(ChatbotUIContext)
  const { rows, loading, error, reload } = useInteractions()
  const [selected, setSelected] = useState<FoodInteraction | null>(null)

  const healthProfile = useMemo(
    () => parseProfile(profile?.profile_context),
    [profile?.profile_context]
  )
  const personalIds = useMemo(
    () => new Set(personalMatches(rows, healthProfile).map(row => row.id)),
    [rows, healthProfile]
  )
  const suggestions = useMemo(() => {
    const meds = healthProfile?.medications || []
    const personal = meds
      .slice(0, 2)
      .map(med => `${med} kullanırken nelere dikkat etmeliyim?`)
    return [
      ...personal,
      "Simvastatin kullanırken greyfurt suyu içebilir miyim?",
      "Kahve ile levotiroksin alınır mı?",
      "Varfarin kullanırken hangi besinlere dikkat etmeliyim?"
    ].slice(0, 3)
  }, [healthProfile])

  return (
    <div className="min-h-full pb-28">
      <AppHeader workspaceId={workspaceId} />

      <section className="nc-gradient-bg relative overflow-hidden text-white">
        <div className="nc-blob pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
        <div
          className="nc-blob pointer-events-none absolute -right-10 bottom-0 size-80 rounded-full bg-emerald-300/20 blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <div className="nc-fade-up mb-5 flex justify-center gap-3">
            <span className="nc-float flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <IconPill size={26} />
            </span>
            <span
              className="nc-float flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur"
              style={{ animationDelay: "1.4s" }}
            >
              <IconHeartHandshake size={26} />
            </span>
          </div>
          <p className="nc-fade-up nc-delay-1 text-sm font-medium text-white/80">
            {greeting()} 👋
          </p>
          <h1 className="nc-fade-up nc-delay-2 mt-1 text-3xl font-bold tracking-tight sm:text-5xl">
            İlaç–Gıda Etkileşimi Rehberi
          </h1>
          <p className="nc-fade-up nc-delay-3 mx-auto mt-4 max-w-2xl text-white/85">
            Hangi ilaçların ve besinlerin birlikte tüketilmemesi gerektiğini
            kaynaklarıyla öğrenin. Profilinize göre kişiselleştirilmiş uyarılar
            ve güncel güvenlik haberleri tek yerde.
          </p>
          <div className="nc-fade-up nc-delay-4 mx-auto mt-6 flex max-w-xl items-start gap-2 rounded-2xl bg-white/10 p-3 text-left text-xs ring-1 ring-white/20 backdrop-blur sm:text-sm">
            <IconInfoCircle size={18} className="mt-0.5 shrink-0" />
            <span>
              <strong>Tıbbi uyarı:</strong> Bu bilgiler yalnızca eğitim
              amaçlıdır. İlaçlarınızda veya beslenmenizde değişiklik yapmadan
              önce mutlaka hekiminize veya eczacınıza danışın.
            </span>
          </div>
          <div className="nc-fade-up nc-delay-5 mt-6 flex flex-wrap justify-center gap-2">
            <a
              href="#etkilesimler"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow transition-transform hover:scale-105"
            >
              Etkileşimleri incele
            </a>
            <a
              href="#haberler"
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 transition-colors hover:bg-white/25"
            >
              Güncel haberler
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 max-w-6xl space-y-8 px-4 sm:px-6">
        <div className="relative">
          {healthProfile ? (
            <ProfileOverview
              profile={healthProfile}
              rows={rows}
              workspaceId={workspaceId}
              onOpen={setSelected}
            />
          ) : (
            <ProfileCallToAction workspaceId={workspaceId} />
          )}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <InteractionExplorer
            rows={rows}
            loading={loading}
            error={error}
            onRetry={reload}
            workspaceId={workspaceId}
            personalIds={personalIds}
          />
          <aside className="space-y-8 xl:sticky xl:top-20 xl:self-start">
            <NewsFeed limit={6} />
          </aside>
        </div>

        <SafetyReminders />
      </div>

      <InteractionDialog
        row={selected}
        workspaceId={workspaceId}
        onClose={() => setSelected(null)}
      />
      <AssistantLauncher workspaceId={workspaceId} suggestions={suggestions} />
    </div>
  )
}
