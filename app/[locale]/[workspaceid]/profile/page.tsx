"use client"

import { AppHeader } from "@/components/nutricare/app-header"
import { HealthProfileWizard } from "@/components/nutricare/health-profile-wizard"
import { ChatbotUIContext } from "@/context/context"
import { IconShieldLock } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { useContext } from "react"

export default function HealthProfilePage() {
  const params = useParams()
  const workspaceId = String(params.workspaceid)
  const { profile } = useContext(ChatbotUIContext)

  return (
    <div className="relative min-h-full pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,hsl(var(--nc-brand-from)/0.18),transparent_70%)]"
      />
      <AppHeader workspaceId={workspaceId} />
      <main className="relative mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="nc-fade-up mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sağlık <span className="nc-gradient-text">profiliniz</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Birkaç kısa soruyla size özel etkileşim uyarıları ve daha isabetli
            asistan yanıtları hazırlayalım.
          </p>
          <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs">
            <IconShieldLock size={14} /> Bilgileriniz yalnızca sizin hesabınızda
            saklanır ve başkalarıyla paylaşılmaz.
          </p>
        </div>
        {profile ? (
          <HealthProfileWizard key={profile.id} workspaceId={workspaceId} />
        ) : (
          <div className="nc-skeleton mx-auto h-96 max-w-2xl rounded-3xl" />
        )}
      </main>
    </div>
  )
}
