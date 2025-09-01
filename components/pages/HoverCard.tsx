"use client"

import { cn } from "@/lib/utils"
import type React from "react"

interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
}

export function HoverCard({ children, className, width, height, ...props }: HoverCardProps) {
  return (
    <div
    className="group/hovercard relative"
    style={{
      width: width ? (typeof width === "number" ? `${width}px` : width) : "auto",
      height: height ? (typeof height === "number" ? `${height}px` : height) : "auto",
    }}
  >
    {/* Shadow element */}
    <div className="absolute inset-0 bg-gray-800 rounded-lg translate-x-[-5px] translate-y-[5px] transition-transform duration-200 group-hover/hovercard:translate-x-[-8px] group-hover/hovercard:translate-y-[8px]"></div>

    {/* Main card */}
    <div className={cn("relative rounded-lg border border-gray-400 bg-white h-full w-full", className)} {...props}>
      {children}
    </div>
  </div>
  )
}

