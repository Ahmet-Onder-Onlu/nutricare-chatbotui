"use client"

import {
  resendConfirmation,
  resetPassword,
  signIn,
  signUp
} from "@/app/[locale]/login/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import {
  PASSWORD_PATTERN,
  PASSWORD_RULES,
  passwordScore
} from "@/lib/auth/password"
import { cn } from "@/lib/utils"
import {
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconLock,
  IconMail
} from "@tabler/icons-react"
import { FC, useState } from "react"

type Tab = "signin" | "signup"

const STRENGTH = [
  { label: "Çok zayıf", color: "bg-red-500" },
  { label: "Zayıf", color: "bg-red-500" },
  { label: "Orta", color: "bg-amber-500" },
  { label: "İyi", color: "bg-lime-500" },
  { label: "Güçlü", color: "bg-emerald-500" }
]

const PasswordInput: FC<{
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  invalid?: boolean
  describedBy?: string
}> = ({ id, name, value, onChange, autoComplete, invalid, describedBy }) => {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <IconLock
        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        size={18}
      />
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="••••••••"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
        className="h-11 rounded-xl pl-10 pr-11 transition-shadow focus-visible:shadow-[0_0_0_4px_hsl(var(--ring)/0.15)]"
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors"
      >
        {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  )
}

const EmailInput: FC = () => (
  <div className="relative">
    <IconMail
      className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
      size={18}
    />
    <Input
      id="email"
      type="email"
      autoComplete="email"
      name="email"
      placeholder="ornek@eposta.com"
      required
      className="h-11 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_hsl(var(--ring)/0.15)]"
    />
  </div>
)

export const LoginForm: FC<{ message?: string; initialTab?: Tab }> = ({
  message,
  initialTab = "signin"
}) => {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const score = passwordScore(password)
  const strong = PASSWORD_PATTERN.test(password)
  const matches = confirm.length > 0 && confirm === password
  const signUpReady = strong && matches

  const switchTab = (next: Tab) => {
    setTab(next)
    setPassword("")
    setConfirm("")
  }

  return (
    <div className="nc-fade-up w-full">
      <div
        role="tablist"
        aria-label="Hesap işlemi"
        className="bg-muted relative mb-6 grid grid-cols-2 rounded-xl p-1"
      >
        <span
          aria-hidden="true"
          className={cn(
            "bg-background absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-sm transition-transform duration-300 ease-out",
            tab === "signup" && "translate-x-full"
          )}
        />
        {(
          [
            ["signin", "Giriş yap"],
            ["signup", "Kayıt ol"]
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => switchTab(value)}
            className={cn(
              "relative z-10 rounded-lg py-2 text-sm font-semibold transition-colors",
              tab === value ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div
          role="status"
          className="nc-pop mb-5 flex gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm"
        >
          <IconInfoCircle className="mt-0.5 shrink-0 text-blue-500" size={18} />
          <span>{message}</span>
        </div>
      )}

      {tab === "signin" ? (
        <form key="signin" action={signIn} className="nc-fade-up space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <EmailInput />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <SubmitButton
                formAction={resetPassword}
                formNoValidate
                variant="link"
                className="h-auto p-0 text-xs"
              >
                Şifremi unuttum
              </SubmitButton>
            </div>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          </div>
          <SubmitButton className="nc-gradient-bg h-11 w-full rounded-xl text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.01] active:scale-[.99]">
            Giriş yap
          </SubmitButton>
          <SubmitButton
            formAction={resendConfirmation}
            formNoValidate
            variant="ghost"
            className="text-muted-foreground w-full text-sm"
          >
            Doğrulama e-postasını yeniden gönder
          </SubmitButton>
        </form>
      ) : (
        <form key="signup" action={signUp} className="nc-fade-up space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <EmailInput />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre oluştur</Label>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              invalid={password.length > 0 && !strong}
              describedBy="password-rules"
            />
            <div className="pt-1" aria-hidden="true">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(step => (
                  <span
                    key={step}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      score >= step ? STRENGTH[score].color : "bg-muted"
                    )}
                  />
                ))}
              </div>
              {password && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Şifre gücü: {STRENGTH[score].label}
                </p>
              )}
            </div>
            <ul id="password-rules" className="grid grid-cols-2 gap-1.5 pt-1">
              {PASSWORD_RULES.map(rule => {
                const ok = rule.test(password)
                return (
                  <li
                    key={rule.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      ok ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full border transition-all",
                        ok
                          ? "scale-110 border-emerald-500 bg-emerald-500 text-white"
                          : "border-current"
                      )}
                    >
                      {ok && <IconCheck size={11} strokeWidth={3} />}
                    </span>
                    {rule.label}
                    <span className="sr-only">
                      {ok ? " (sağlandı)" : " (eksik)"}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Şifreyi tekrar girin</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              invalid={confirm.length > 0 && !matches}
              describedBy="confirm-hint"
            />
            {confirm.length > 0 && !matches && (
              <p
                id="confirm-hint"
                className="flex items-center gap-1 text-xs text-red-500"
              >
                <IconAlertCircle size={14} /> Şifreler eşleşmiyor
              </p>
            )}
          </div>
          <SubmitButton
            disabled={!signUpReady}
            className="nc-gradient-bg h-11 w-full rounded-xl text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[.99] disabled:scale-100 disabled:opacity-50"
          >
            Hesap oluştur
          </SubmitButton>
          <p className="text-muted-foreground text-center text-xs">
            Kayıt olduktan sonra e-posta adresinize bir doğrulama bağlantısı
            gönderilir.
          </p>
        </form>
      )}
    </div>
  )
}
