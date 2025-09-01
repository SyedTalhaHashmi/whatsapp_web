import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Session Storage Utilities
export function getSessionStorageItem(key: string): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(key)
  }
  return null
}

export function setSessionStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, value)
  }
}

export function clearSessionStorage(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.clear()
  }
}