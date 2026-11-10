import { LogoWordmark } from "@/components/nutricare/logo"
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconArrowRight,
  IconBroadcast,
  IconCircleCheck,
  IconClipboardHeart,
  IconMessageChatbot,
  IconShieldCheck
} from "@tabler/icons-react"
import Link from "next/link"

const FEATURES = [
  {
    Icon: IconClipboardHeart,
    title: "Kişisel sağlık profili",
    body: "Yaş, kilo, hastalık, ilaç ve alerji bilgilerinize göre size özel uyarılar."
  },
  {
    Icon: IconShieldCheck,
    title: "Renk kodlu risk düzeyleri",
    body: "Yüksek, orta ve kayıt bulunmayan etkileşimler kırmızı, sarı ve yeşil ile ayrılır."
  },
  {
    Icon: IconMessageChatbot,
    title: "Kaynaklı asistan",
    body: "Sorularınıza veri tabanındaki kayıtlara ve orijinal kaynaklarına dayanarak yanıt verir."
  },
  {
    Icon: IconBroadcast,
    title: "Kritik güvenlik haberleri",
    body: "Resmî kurumların güncel ilaç güvenliği duyurularına tek yerden ulaşın."
  }
]

const PREVIEW = [
  {
    Icon: IconAlertOctagon,
    tone: "border-red-500/40 bg-red-500/10 text-red-500",
    label: "Yüksek risk",
    title: "Varfarin × K vitamini zengin besinler"
  },
  {
    Icon: IconAlertTriangle,
    tone: "border-amber-400/50 bg-amber-400/10 text-amber-500",
    label: "Orta risk",
    title: "Siprofloksasin × Süt ürünleri"
  },
  {
    Icon: IconCircleCheck,
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    label: "Kayıt yok",
    title: "Etkileşim kaydı bulunamadı"
  }
]

export default function HomePage() {
  return (
    <div className="relative size-full overflow-y-auto overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,hsl(var(--nc-brand-from)/0.22),transparent_65%)]"
      />
      <div className="nc-blob pointer-events-none absolute -left-24 top-32 size-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div
        className="nc-blob pointer-events-none absolute -right-24 top-10 size-80 rounded-full bg-emerald-500/10 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />

      <header className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <LogoWordmark size={36} />
        <Link
          href="/login"
          className="hover:bg-muted rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Giriş yap
        </Link>
      </header>

      <main className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="nc-fade-up bg-primary/10 text-primary mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
            Besin–ilaç etkileşimlerinde kaynaklı rehber
          </p>
          <h1 className="nc-fade-up nc-delay-1 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            İlacınız ve tabağınız{" "}
            <span className="nc-gradient-text">güvenle</span> bir arada.
          </h1>
          <p className="nc-fade-up nc-delay-2 text-muted-foreground mt-5 text-lg">
            NutriCare, sağlık profilinize göre riskli kombinasyonları öne
            çıkarır, kaynak gösteren bir asistanla sorularınızı yanıtlar ve
            güncel güvenlik duyurularını takip eder.
          </p>
          <div className="nc-fade-up nc-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?tab=signup"
              className="nc-gradient-bg inline-flex items-center gap-1.5 rounded-xl px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.03]"
            >
              Ücretsiz başlayın <IconArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="bg-card hover:bg-muted inline-flex items-center rounded-xl border px-6 py-3 font-semibold transition-colors"
            >
              Hesabım var
            </Link>
          </div>
          <p className="nc-fade-up nc-delay-4 text-muted-foreground mt-6 text-xs">
            Bilgiler eğitim amaçlıdır; hekim veya eczacı görüşünün yerini
            tutmaz.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="bg-card nc-fade-up nc-delay-2 rounded-3xl border p-5 shadow-2xl shadow-blue-500/10">
            <p className="mb-4 text-sm font-semibold">
              Örnek etkileşim kartları
            </p>
            <div className="space-y-3">
              {PREVIEW.map(({ Icon, tone, label, title }, index) => (
                <div
                  key={label}
                  className={`nc-fade-up flex items-center gap-3 rounded-2xl border p-3 ${tone}`}
                  style={{ animationDelay: `${400 + index * 150}ms` }}
                >
                  <Icon size={22} className="shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="nc-float bg-card absolute -bottom-6 -left-4 hidden rounded-2xl border px-4 py-3 shadow-xl sm:block">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <IconMessageChatbot size={20} className="text-primary" /> Asistana
              sor
            </p>
          </div>
        </div>
      </main>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, body }, index) => (
            <div
              key={title}
              className="nc-fade-up nc-card-hover bg-card rounded-2xl border p-5"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-xl">
                <Icon size={22} />
              </span>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
