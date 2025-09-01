"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SETTINGS_TABS = [
  // { key: "teams", label: "Teams", path: "/flow/settings/teams" },
  { key: "agents", label: "Agents", path: "/flow/settings/agents" },
  { key: "knowledge", label: "Knowledge Base", path: "/flow/knowledge" },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Mobile Navigation - Top Tabs */}
      <nav className="block md:hidden w-full bg-white border-b sticky top-0 z-20">
        <div className="p-4 font-bold text-lg border-b">Settings</div>
        <div className="flex">
          {SETTINGS_TABS.map(tab => (
            <Link
              key={tab.key}
              href={tab.path}
              className={`flex-1 py-3 px-2 text-center text-sm font-medium transition-colors ${
                pathname === tab.path 
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar */}
        <nav className="flex flex-col w-64 bg-white border-r h-full sticky top-0 z-10">
          <div className="p-6 font-bold text-lg">Settings</div>
          {SETTINGS_TABS.map(tab => (
            <Link
              key={tab.key}
              href={tab.path}
              className={`px-6 py-3 text-left font-medium transition-colors ${
                pathname === tab.path 
                  ? 'bg-green-50 text-green-700 border-r-4 border-green-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Main Content */}
      <main className="block md:hidden p-4">
        {children}
      </main>
    </div>
  )
} 