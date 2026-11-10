import { RISK_META, RiskLevel } from "@/lib/interactions/risk"
import { cn } from "@/lib/utils"
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconCircleCheck
} from "@tabler/icons-react"
import { FC } from "react"

const ICONS = {
  high: IconAlertOctagon,
  moderate: IconAlertTriangle,
  none: IconCircleCheck
}

export const RiskBadge: FC<{
  level: RiskLevel
  variant?: "short" | "long"
  className?: string
}> = ({ level, variant = "long", className }) => {
  const meta = RISK_META[level]
  const Icon = ICONS[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        meta.badge,
        className
      )}
    >
      <Icon size={14} aria-hidden="true" />
      {variant === "short" ? meta.short : meta.label}
    </span>
  )
}
