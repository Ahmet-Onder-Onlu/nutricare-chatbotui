"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { useRouter } from "next/navigation"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { Input } from "../ui/input"
import { toast } from "sonner"
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE
} from "@/lib/auth/password"

interface ChangePasswordProps {}

export const ChangePassword: FC<ChangePasswordProps> = () => {
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleResetPassword = async () => {
    if (!newPassword) return toast.info("Lütfen yeni şifrenizi girin.")
    if (!isStrongPassword(newPassword))
      return toast.error(PASSWORD_REQUIREMENT_MESSAGE)
    if (newPassword !== confirmPassword)
      return toast.error("Şifreler birbiriyle eşleşmiyor.")

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return toast.error("Şifre güncellenemedi: " + error.message)

    toast.success("Şifreniz güncellendi.")

    return router.push("/login")
  }

  return (
    <Dialog open={true}>
      <DialogContent className="w-[min(420px,92vw)] p-4">
        <DialogHeader>
          <DialogTitle>Yeni şifre belirleyin</DialogTitle>
        </DialogHeader>

        <Input
          id="password"
          placeholder="Yeni şifre (en az 8 karakter, büyük/küçük harf, rakam)"
          autoComplete="new-password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />

        <Input
          id="confirmPassword"
          placeholder="Yeni şifreyi tekrar girin"
          autoComplete="new-password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        <DialogFooter>
          <Button onClick={handleResetPassword}>Şifreyi güncelle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
