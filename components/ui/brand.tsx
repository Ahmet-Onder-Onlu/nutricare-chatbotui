"use client"

import Link from "next/link"
import { FC } from "react"
import { LogoMark } from "../nutricare/logo"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = () => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
      href="/"
    >
      <LogoMark size={64} className="nc-float mb-3" />
      <div className="text-4xl font-bold tracking-tight">
        Nutri<span className="nc-gradient-text">Care</span>
      </div>
    </Link>
  )
}
