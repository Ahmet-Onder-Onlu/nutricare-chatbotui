"use client"

import React from "react"
import { useFormStatus } from "react-dom"
import { Button, ButtonProps } from "./button"

const SubmitButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { pending } = useFormStatus()

    return (
      <Button
        ref={ref}
        {...props}
        disabled={pending || props.disabled}
        aria-busy={pending || undefined}
      />
    )
  }
)

SubmitButton.displayName = "SubmitButton"

export { SubmitButton }
