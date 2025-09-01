"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type React from "react";

interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  isActive?: boolean; // Only used as the initial state
}

export function HoverCard({
  children,
  className,
  width,
  height,
  isActive, // Used only for initialization
  ...props
}: HoverCardProps) {


  return (
    <div
      className={cn(
        "relative cursor-pointer transition-transform duration-200",
        // isClicked ? "scale-105" : "scale-100"
      )}
      style={{
        width: width ? (typeof width === "number" ? `${width}px` : width) : "auto",
        height: height ? (typeof height === "number" ? `${height}px` : height) : "auto",
      }}
     
    >
      {/* Shadow element */}
      <div
       className={cn(
        "absolute inset-0 bg-gray-800 rounded-lg transition-transform duration-200",
        "translate-x-[-5px] translate-y-[5px]" 
      )}
      ></div>

      {/* Main card */}
      <div
        className={cn(
          "relative rounded-lg border border-gray-400 bg-white h-full w-full transition-transform duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
