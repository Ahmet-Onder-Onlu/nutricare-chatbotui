import {
  IconClipboardList,
  IconClock,
  IconStethoscope,
  IconTag
} from "@tabler/icons-react"

const REMINDERS = [
  {
    Icon: IconStethoscope,
    title: "Her zaman profesyonellere danışın",
    body: "Doktorunuza veya eczacınıza danışmadan ilaç dozunu ya da tedavinizi değiştirmeyin."
  },
  {
    Icon: IconTag,
    title: "Tüm etiketleri okuyun",
    body: "İlaç prospektüslerini ve gıda etiketlerini etkileşim uyarıları açısından kontrol edin."
  },
  {
    Icon: IconClock,
    title: "Zamanlamaya dikkat edin",
    body: "Bazı etkileşimler, ilaç ve besin arasında birkaç saat bırakılarak azaltılabilir."
  },
  {
    Icon: IconClipboardList,
    title: "Kayıt tutun",
    body: "Kullandığınız tüm ilaç, vitamin ve bitkisel takviyelerin güncel listesini saklayın."
  }
]

export function SafetyReminders() {
  return (
    <section
      aria-labelledby="reminders-title"
      className="nc-fade-up rounded-3xl border bg-gradient-to-br from-blue-500/5 to-emerald-500/5 p-6"
    >
      <h2 id="reminders-title" className="mb-5 text-center text-xl font-bold">
        Önemli güvenlik hatırlatmaları
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REMINDERS.map(({ Icon, title, body }, index) => (
          <div
            key={title}
            className="nc-fade-up nc-card-hover bg-card rounded-2xl border p-4"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="bg-primary/10 text-primary mb-3 flex size-10 items-center justify-center rounded-xl">
              <Icon size={20} />
            </span>
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {title}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
