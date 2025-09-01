"use client"

import { useState, useEffect } from "react"
import { Home, Users, FileText, User, HelpCircle, Bell, LogOut, Menu, X, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationModal } from "@/components/shared/notification-modal"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  icon?: any
  label: string
  link?: string
  component?: () => JSX.Element
  hasSeparator?: boolean
}

export default function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuItemClick = (label: string) => {
    if (label === "Notification") {
      setNotificationOpen(true)
    } else if (label === "Logout") {
      setLogoutOpen(true)
    }
  }

  const mainMenuItems: MenuItem[] = [
    { icon: Home, label: "Home", link: "/dashboard" },
    { component: ThemeToggle, label: "Theme", hasSeparator: true },
    { icon: Bell, label: "Notification" },
  ]
  const logoutItem: MenuItem = { icon: LogOut, label: "Logout" }
  

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed bg-transparent top-[17px] left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="text-foreground" size={24} /> : <Menu size={24} className="text-foreground" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className,
        )}
      >
        {/* Logo */}
        <div className="flex py-4 items-center justify-center h-16 px-4">
          <Image className="dark:hidden " src="/logo.svg" alt="Logo" width={200} height={150} />
          <Image className="hidden dark:block" src="/logo-white.png" alt="Logo" width={150} height={100} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {mainMenuItems.map((item, index) => (
            <div key={index}>
          
              
              {item.component ? (
                // If item has a component -> render the component
                <div className="flex items-center  text-sm font-bold rounded-md hover:bg-accent hover:text-accent-foreground">
                  <item.component />
                  <span className="">{item.label}</span>
                </div>
              ) : item.link ? (
                // If item has link -> normal link
                <Link
                  href={item.link}
                  className="flex items-center px-2 py-3 text-sm font-bold rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="w-5 font-bold h-5 mr-3" />
                  {item.label}
                </Link>
              ) : (
                // If item has NO link -> behave like a button
                <button
                  onClick={() => handleMenuItemClick(item.label)}
                  className="w-full flex items-center px-2 py-3 text-sm font-bold rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="w-5 font-bold h-5 mr-3" />
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={() => handleMenuItemClick(logoutItem.label)}
            className="w-full flex items-center px-2 py-3 text-sm font-bold rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <logoutItem.icon className="w-5 font-bold h-5 mr-3" />
            {logoutItem.label}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Logout</DialogTitle>
            <DialogDescription className="text-muted-foreground">Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false)
                console.log("User logged out")
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
