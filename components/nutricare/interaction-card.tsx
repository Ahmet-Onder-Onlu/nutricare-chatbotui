"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog"
import {
  classifyRisk,
  cleanField,
  FoodInteraction,
  interactionTitle,
  RISK_META
} from "@/lib/interactions/risk"
import { cn } from "@/lib/utils"
import {
  IconBook2,
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconMessageCircle2,
  IconShieldCheck,
  IconUsers,
  IconX,
  IconZoomQuestion
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, ReactNode } from "react"
import { RiskBadge } from "./risk-badge"

export function askAssistantHref(workspaceId: string, question: string) {
  return `/${workspaceId}/chat?q=${encodeURIComponent(question.slice(0, 500))}`
}

const Field: FC<{ icon: ReactNode; label: string; children: ReactNode }> = ({
  icon,
  label,
  children
}) => (
  <div className="flex gap-3">
    <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
      {icon}
    </span>
    <div className="min-w-0">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="text-muted-foreground whitespace-pre-wrap break-words text-sm">
        {children}
      </dd>
    </div>
  </div>
)

function renderSources(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return parts.map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-0.5 break-all underline-offset-2 hover:underline"
      >
        {part.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
        <IconExternalLink size={12} />
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

export const InteractionCard: FC<{
  row: FoodInteraction
  onOpen: (row: FoodInteraction) => void
  index?: number
  highlight?: boolean
}> = ({ row, onOpen, index = 0, highlight }) => {
  const level = classifyRisk(row)
  const meta = RISK_META[level]
  const mechanism = cleanField(row.mechanism)
  const management = cleanField(row.management)
  return (
    <button
      type="button"
      onClick={() => onOpen(row)}
      className={cn(
        "nc-fade-up nc-card-hover group flex size-full flex-col rounded-2xl border p-4 text-left focus-visible:outline-none focus-visible:ring-2",
        meta.card,
        meta.ring,
        highlight && "ring-2"
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <RiskBadge level={level} />
        {highlight && (
          <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
            Profilinizle ilgili
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 font-semibold leading-snug">
        {interactionTitle(row)}
      </h3>
      {row.latin_name && (
        <p className="text-muted-foreground mt-0.5 text-xs italic">
          {row.latin_name}
        </p>
      )}
      {cleanField(row.active_ingredient) && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-300">
            {cleanField(row.active_ingredient).slice(0, 40)}
          </span>
        </div>
      )}
      <dl className="mt-3 space-y-2 text-sm">
        {mechanism && (
          <div>
            <dt className="font-semibold">Etkileşim</dt>
            <dd className="text-muted-foreground line-clamp-2">{mechanism}</dd>
          </div>
        )}
        {management && (
          <div>
            <dt className="flex items-center gap-1 font-semibold">
              <IconShieldCheck size={14} /> Öneri
            </dt>
            <dd className="text-muted-foreground line-clamp-2">{management}</dd>
          </div>
        )}
        {!mechanism && !management && (
          <dd className="text-muted-foreground">{meta.description}</dd>
        )}
      </dl>
      <span className="text-primary mt-auto pt-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Ayrıntıları gör →
      </span>
    </button>
  )
}

export const InteractionDialog: FC<{
  row: FoodInteraction | null
  workspaceId?: string
  onClose: () => void
}> = ({ row, workspaceId, onClose }) => {
  const level = row ? classifyRisk(row) : "none"
  const meta = RISK_META[level]
  return (
    <Dialog open={!!row} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[88dvh] w-[min(640px,94vw)] overflow-y-auto rounded-2xl p-0">
        {row && (
          <>
            <div
              className={cn(
                "sticky top-0 z-10 border-b p-5 backdrop-blur",
                meta.card
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <RiskBadge level={level} />
                  <DialogTitle className="mt-2 text-xl font-bold leading-snug">
                    {interactionTitle(row)}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs">
                    {meta.description}
                  </DialogDescription>
                </div>
                <DialogClose
                  aria-label="Kapat"
                  className="hover:bg-muted rounded-lg p-1.5 transition-colors"
                >
                  <IconX size={20} />
                </DialogClose>
              </div>
            </div>
            <dl className="space-y-4 p-5">
              {cleanField(row.active_ingredient) && (
                <Field
                  icon={<IconZoomQuestion size={16} />}
                  label="Etken madde"
                >
                  {cleanField(row.active_ingredient)}
                  {cleanField(row.pharmacological_effect) &&
                    ` — ${cleanField(row.pharmacological_effect)}`}
                </Field>
              )}
              {cleanField(row.interacting_drugs) && (
                <Field
                  icon={<IconMessageCircle2 size={16} />}
                  label="Etkileşen ilaçlar"
                >
                  {cleanField(row.interacting_drugs)}
                </Field>
              )}
              {cleanField(row.mechanism) && (
                <Field
                  icon={<IconZoomQuestion size={16} />}
                  label="Mekanizma ve olası sonuç"
                >
                  {cleanField(row.mechanism)}
                </Field>
              )}
              {cleanField(row.management) && (
                <Field icon={<IconShieldCheck size={16} />} label="Öneri">
                  {cleanField(row.management)}
                </Field>
              )}
              {cleanField(row.onset) && (
                <Field
                  icon={<IconClock size={16} />}
                  label="Başlangıç / zamanlama"
                >
                  {cleanField(row.onset)}
                </Field>
              )}
              {cleanField(row.risk_groups) && (
                <Field icon={<IconUsers size={16} />} label="Riskli gruplar">
                  {cleanField(row.risk_groups)}
                </Field>
              )}
              {cleanField(row.sources) && (
                <Field icon={<IconBook2 size={16} />} label="Kaynak">
                  {renderSources(cleanField(row.sources))}
                </Field>
              )}
              {cleanField(row.updated_at_source) && (
                <Field icon={<IconCalendar size={16} />} label="Güncelleme">
                  {cleanField(row.updated_at_source)}
                </Field>
              )}
            </dl>
            <div className="bg-muted/40 flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs">
                Risk düzeyi kaynak metnindeki ifadelere göre otomatik
                belirlenir; klinik karar için hekiminize danışın.
              </p>
              {workspaceId && (
                <Link
                  href={askAssistantHref(
                    workspaceId,
                    `${row.food_name} ile ${cleanField(row.interacting_drugs) || "ilaçlarım"} birlikte kullanılabilir mi?`
                  )}
                  className="nc-gradient-bg inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
                >
                  <IconMessageCircle2 size={16} /> Asistana sor
                </Link>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
