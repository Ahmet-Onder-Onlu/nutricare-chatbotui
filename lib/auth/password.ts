/**
 * NutriCare parola politikası: en az 8 karakter, en az bir büyük harf,
 * bir küçük harf ve bir rakam. Türkçe harfler (Ç, Ğ, İ, Ö, Ş, Ü) de sayılır.
 * Üst sınır 72 karakterdir (bcrypt yalnızca ilk 72 baytı kullanır).
 */
export const PASSWORD_PATTERN =
  /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*\p{Nd})[^\s]{8,72}$/u

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "En az 8 karakter",
    test: (v: string) => v.length >= 8
  },
  {
    id: "upper",
    label: "En az bir büyük harf",
    test: (v: string) => /\p{Lu}/u.test(v)
  },
  {
    id: "lower",
    label: "En az bir küçük harf",
    test: (v: string) => /\p{Ll}/u.test(v)
  },
  {
    id: "digit",
    label: "En az bir rakam",
    test: (v: string) => /\p{Nd}/u.test(v)
  }
] as const

export const PASSWORD_REQUIREMENT_MESSAGE =
  "Şifre en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf ve bir rakam içermeli, boşluk içermemelidir."

export function isStrongPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password)
}

/** 0-4 arası; arayüzdeki güç çubuğu için. */
export function passwordScore(password: string): number {
  if (!password) return 0
  return PASSWORD_RULES.filter(rule => rule.test(password)).length
}
