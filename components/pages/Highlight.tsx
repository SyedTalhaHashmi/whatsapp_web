import type React from "react"
import { cn } from "@/lib/utils"

interface HighlightProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function Highlight({ children, className, color = "bg-pink-200" }: HighlightProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      {/* The text content */}
      <span className="relative z-10">{children}</span>

      {/* The highlight background */}
      <span
        className={cn("absolute inset-0 -z-0 rounded-lg", color)}
        style={{
            bottom: "-0.05em", // Moves it slightly lower
            top: "0.5em", // Reduces the height from the top
            left: "-0.1em", // Brings highlight closer to text
            right: "-0.1em", // Same as left for balance
        }}
      ></span>
    </span>
  )
}

