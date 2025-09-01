"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StyledSwitchProps {
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

const StyledSwitch = React.forwardRef<HTMLButtonElement, StyledSwitchProps>(
  ({ checked = false, disabled = false, onChange, className, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-5 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked 
            ? "bg-green-800" 
            : "bg-red-200",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    )
  }
)

StyledSwitch.displayName = "StyledSwitch"

export { StyledSwitch } 