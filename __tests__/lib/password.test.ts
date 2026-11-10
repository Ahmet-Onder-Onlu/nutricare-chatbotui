import {
  isStrongPassword,
  PASSWORD_PATTERN,
  passwordScore
} from "@/lib/auth/password"

describe("password policy", () => {
  it.each(["Abcdefg1", "Güçlü-Şifre9", "ŞİFRE1ğü", "N0tr1Care!"])(
    "accepts %s",
    value => expect(isStrongPassword(value)).toBe(true)
  )
  it.each([
    "",
    "Ab1",
    "abcdefg1",
    "ABCDEFG1",
    "Abcdefgh",
    "Abc defg1",
    "A1" + "a".repeat(71)
  ])("rejects %p", value => expect(PASSWORD_PATTERN.test(value)).toBe(false))
  it("scores each satisfied rule", () => {
    expect(passwordScore("")).toBe(0)
    expect(passwordScore("abc")).toBe(1)
    expect(passwordScore("abcdefgh")).toBe(2)
    expect(passwordScore("Abcdefgh")).toBe(3)
    expect(passwordScore("Abcdefg1")).toBe(4)
  })
})
