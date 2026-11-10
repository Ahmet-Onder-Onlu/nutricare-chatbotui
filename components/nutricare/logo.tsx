import { cn } from "@/lib/utils"
import { FC } from "react"

interface LogoMarkProps {
  size?: number
  className?: string
}

/** Kapsül + yaprak: ilaç ve besin buluşması. Yerel SVG, ağ isteği yok. */
export const LogoMark: FC<LogoMarkProps> = ({ size = 40, className }) => (
  <span
    className={cn(
      "nc-gradient-bg inline-flex shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-blue-500/20",
      className
    )}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 32 32"
      width={size * 0.62}
      height={size * 0.62}
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="12"
        width="17"
        height="8"
        rx="4"
        transform="rotate(-35 11.5 16)"
      />
      <path d="M8.7 12.2l4.9 7" />
      <path
        d="M21 26c-3-1-4.5-3.8-4-7 3.5-.8 7.2.4 9 3.3-1.4 2.6-3 3.9-5 3.7z"
        fill="white"
        fillOpacity=".25"
      />
      <path d="M17.3 19.3c2.4 1.4 4.2 3.2 5.4 5.4" />
    </svg>
  </span>
)

export const LogoWordmark: FC<{ className?: string; size?: number }> = ({
  className,
  size = 36
}) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <LogoMark size={size} />
    <span className="text-xl font-bold tracking-tight">
      Nutri<span className="nc-gradient-text">Care</span>
    </span>
  </span>
)
