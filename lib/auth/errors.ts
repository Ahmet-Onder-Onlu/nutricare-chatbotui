import { PASSWORD_REQUIREMENT_MESSAGE } from "@/lib/auth/password"

export const EMAIL_NOT_CONFIRMED =
  "E-posta adresinizi doğrulayın. Gerekirse aşağıdan yeni onay bağlantısı isteyin."

export const EMAIL_RATE_LIMIT_MESSAGE =
  "Şu anda çok fazla doğrulama e-postası gönderildi. Lütfen birkaç dakika sonra tekrar deneyin. Daha önce kayıt olduysanız e-posta kutunuzu ve spam klasörünüzü kontrol edin."

export function isRateLimited(message: string) {
  return /rate limit|too many requests|over_email_send_rate_limit/i.test(
    message
  )
}

export function translateAuthError(message: string) {
  if (isRateLimited(message)) return EMAIL_RATE_LIMIT_MESSAGE
  const wait = message.match(/after (\d+) seconds?/i)
  if (wait)
    return `Güvenlik nedeniyle bu işlemi ${wait[1]} saniye sonra tekrar deneyebilirsiniz.`
  if (message === "Email not confirmed") return EMAIL_NOT_CONFIRMED
  if (message === "Invalid login credentials")
    return "E-posta veya şifre hatalı."
  if (/already registered/i.test(message))
    return "Bu e-posta adresiyle kayıtlı bir hesap var. Giriş yapmayı deneyin."
  if (
    /password/i.test(message) &&
    /(weak|short|least|character)/i.test(message)
  )
    return PASSWORD_REQUIREMENT_MESSAGE
  return message
}
