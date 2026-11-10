"use client"

import { LogoWordmark } from "@/components/nutricare/logo"
import {
  IconApple,
  IconLeaf,
  IconPill,
  IconShieldCheck,
  IconSparkles,
  IconStethoscope
} from "@tabler/icons-react"
import { useEffect, useState } from "react"

const TIPS = [
  {
    risk: "Kaçının",
    tone: "bg-red-500/15 text-red-100 ring-red-300/40",
    title: "Greyfurt × Statinler",
    body: "CYP3A4 inhibisyonu ilaç düzeyini artırabilir."
  },
  {
    risk: "Dikkat",
    tone: "bg-amber-400/15 text-amber-50 ring-amber-200/40",
    title: "Süt ürünleri × Siprofloksasin",
    body: "Kalsiyum emilimi azaltabilir; 2 saat arayla alın."
  },
  {
    risk: "Kayıt yok",
    tone: "bg-emerald-400/15 text-emerald-50 ring-emerald-200/40",
    title: "Etkileşim kaydı bulunmadı",
    body: "Kayıt olmaması güvenli olduğu anlamına gelmez."
  }
]

const FLOATERS = [
  { Icon: IconPill, className: "left-[8%] top-[18%]", delay: "0s" },
  { Icon: IconLeaf, className: "right-[10%] top-[12%]", delay: "1.2s" },
  { Icon: IconApple, className: "right-[38%] bottom-[12%]", delay: "2.1s" },
  {
    Icon: IconStethoscope,
    className: "right-[14%] bottom-[30%]",
    delay: "0.6s"
  }
]

export function AuthShowcase() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(
      () => setIndex(value => (value + 1) % TIPS.length),
      3800
    )
    return () => window.clearInterval(id)
  }, [])
  const tip = TIPS[index]

  return (
    <section className="nc-gradient-bg relative hidden h-full overflow-hidden p-10 text-white lg:flex lg:flex-col">
      <div className="nc-blob absolute -left-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
      <div
        className="nc-blob absolute -bottom-32 -right-16 size-96 rounded-full bg-emerald-300/20 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      {FLOATERS.map(({ Icon, className, delay }) => (
        <span
          key={className}
          aria-hidden="true"
          className={`nc-float absolute flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur ${className}`}
          style={{ animationDelay: delay }}
        >
          <Icon size={24} />
        </span>
      ))}

      <div className="relative z-10 [&_.nc-gradient-text]:text-white">
        <LogoWordmark size={40} />
      </div>

      <div className="relative z-10 my-auto max-w-md">
        <p className="nc-fade-up mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
          <IconSparkles size={14} /> Kaynaklı besin–ilaç asistanı
        </p>
        <h1 className="nc-fade-up nc-delay-1 text-4xl font-bold leading-tight">
          İlacınız ve tabağınız
          <br />
          aynı dili konuşsun.
        </h1>
        <p className="nc-fade-up nc-delay-2 mt-4 text-white/80">
          Sağlık profilinize göre kişiselleştirilmiş etkileşim uyarıları, güncel
          güvenlik haberleri ve kaynak gösteren bir asistan.
        </p>

        <div
          key={index}
          className={`nc-pop mt-8 rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-md`}
          aria-live="polite"
        >
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${tip.tone}`}
          >
            {tip.risk}
          </span>
          <p className="mt-2 text-lg font-semibold">{tip.title}</p>
          <p className="text-sm text-white/80">{tip.body}</p>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {TIPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full bg-white transition-all duration-500 ${i === index ? "w-6 opacity-100" : "w-1.5 opacity-40"}`}
            />
          ))}
        </div>
      </div>

      <p className="relative z-10 flex items-center gap-2 text-xs text-white/70">
        <IconShieldCheck size={16} /> Bilgiler eğitim amaçlıdır; tedavinizi
        değiştirmeden önce hekiminize veya eczacınıza danışın.
      </p>
    </section>
  )
}
