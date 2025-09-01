"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CustomButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  href?: string
  target?: "_blank" | "_self" | "_parent" | "_top"
}

export function CustomButton({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
  href,
  target,
}: CustomButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  const variantStyles = {
    primary: "bg-blue-500 text-white ",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }

  const sizeStyles = {
    sm: "h-9 px-4 py-2 text-sm",
    md: "h-11 px-6 py-2.5 text-base",
    lg: "h-[3.5rem] px-8 py-6 text-sm", // Increased height by 10 units (2.5rem/40px)
  }

  const combinedStyles = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    "relative transition-all duration-200",
    className,
  )

  return (
    <div>
    <div className="inline-block relative group">
      {/* Gray background/shadow effect that grows on hover */}
      <div className="absolute inset-0 bg-gray-200 rounded translate-x-[-5px] translate-y-[5px] transition-transform duration-200 group-hover:translate-x-[-8px] group-hover:translate-y-[8px]"></div>

      {href ? (
        <Link href={href} target={target} className={combinedStyles} onClick={onClick}>
          {children}
        </Link>
      ) : (
        <button className={combinedStyles} onClick={onClick}>
          {children}
        </button>
      )}
    </div>
    </div>
  )
}

