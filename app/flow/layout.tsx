"use client"
import Link from "next/link"
import type React from "react"

import { useState, useEffect } from "react"
import {
  Home,
  Users,
  FileText,
  User,
  HelpCircle,
  Bell,
  Menu,
  X,
  FileQuestion,
  CheckSquare,
  BarChart2,
  Bot,
  FileIcon,
  LogOut,
  MonitorPlay,
  BookText,
  HomeIcon,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { cn, getSessionStorageItem, clearSessionStorage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import clsx from "clsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { NotificationModal } from "@/components/shared/notification-modal"
import { useRouter } from "next/navigation"
import Topbar from "@/components/dashboardItems/topbar"
import { SupportModalProvider } from "@/components/dashboardItems/support-modal"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  useEffect(() => {
    const userLoginData = getSessionStorageItem('userLoginData')
    if (!userLoginData) {
      router.push('/auth/sign-in')
    }
  }, [])
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    shared: true,
    quiz: true,
    services: true,
  })

  // Get user role from session
  const getUserRole = () => {
    const userRole = getSessionStorageItem('userRole')
    if (userRole) {
      return userRole.toLowerCase()
    }
    return null
  }

  // Dynamic navigation based on user role
  const getServicesSections = () => {
    const userRole = getUserRole()
    
    switch (userRole) {
      case 'admin':
        return [
          {
            title: "Chats",
            key: "quiz",
            items: [
              { label: "All Chats", link: "/flow/chats" },
            ],
          },
          {
            title: "Services",
            key: "services",
            items: [
              { label: "Manage Users", link: "/flow/roles" },
              { label: "WhatsApp Config", link: "/flow/setup" },
              { label: "Knowledge Base", link: "/flow/knowledge", badge: "new" },
              { label: "Departments", link: "/flow/department", badge: "new" },
              { label: "Vector Database", link: "/flow/vector-database", badge: "new" },
              { label: "AI Configuration", link: "/flow/configuration", badge: "new" },
              { label: "All Settings", link: "/flow/all-settings", badge: "new" },
            ],
          },
        ]
      
      case 'manager':
        return [
          {
            title: "Chats",
            key: "quiz",
            items: [
              { label: "All Chats", link: "/flow/chats" },
            ],
          },
          {
            title: "Services",
            key: "services",
            items: [
              { label: "Manage Users", link: "/flow/roles" },
              // { label: "Setup", link: "/flow/setup" },
              // { label: "Knowledge Base", link: "/flow/knowledge", badge: "new" },
              { label: "Departments", link: "/flow/department", badge: "new" },
              { label: "Vector Database", link: "/flow/vector-database", badge: "new" },
              // { label: "Configuration", link: "/flow/configuration", badge: "new" },
              // { label: "All Settings", link: "/flow/all-settings", badge: "new" },
            ],
          },
        ]
      
      case 'agent':
        return [
          {
            title: "Chats",
            key: "quiz",
            items: [
              { label: "All Chats", link: "/flow/chats" },
            ],
          },
          
        ]
      
      case 'department head':
        return [
          {
            title: "Chats",
            key: "quiz",
            items: [
              { label: "All Chats", link: "/flow/chats" },
            ],
          },
          {
            title: "Services",
            key: "services",
            items: [
              // { label: "Setup", link: "/flow/setup" },
              { label: "Manage Users", link: "/flow/roles" },
              // { label: "Knowledge Base", link: "/flow/knowledge", badge: "new" },
              { label: "Departments", link: "/flow/department", badge: "new" },
              // { label: "Configuration", link: "/flow/configuration", badge: "new" },
            ],
          },
        ]
      
      default:
        return [
          {
            title: "Chats",
            key: "quiz",
            items: [
              { label: "All Chats", link: "/flow/chats" },
            ],
          },
          
        ]
    }
  }

  const servicesSections = getServicesSections()

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

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Icon-only sidebar items
  const iconItems = [
    { icon: Home, label: "Home", link: "/dashboard" },
    // { icon: Users, label: "My learning", link: "/dashboard" },
    // { icon: FileText, label: "Add Courses", hasSeparator: true, link: "/dashboard" },
    { component: ThemeToggle, label: "Theme" },
    // { icon: User, label: "Account", link: "/dashboard/account" },
    // { icon: HelpCircle, label: "Help", hasSeparator: true, link: "/dashboard/help" },
    { icon: Bell, label: "Notification" },
    { icon: LogOut, label: "Logout" },
  ]

  // Define the type for icon items to fix TypeScript error
  type IconItem = {
    icon?: any;
    component?: any;
    label: string;
    link?: string;
    hasSeparator?: boolean;
  }

  // Define the type for service items
  type ServiceItem = {
    label: string;
    link?: string;
    badge?: number;
  }

  function getRandomColor(): string {
    const colors = ["yellow", "pink", "purple", "blue", "red", "orange", "green", "brown"]
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }

  // Item component for tree structure
  const Item = ({
    name,
    isLast = false,
    badge,
    link,
  }: {
    name: string;
    isLast?: boolean;
    badge?: number;
    link?: string;
  }) => (
    <div className="relative pl-6 pr-2 py-1 text-sm font-semibold text-foreground">
      {/* Vertical Line */}
      <div
       
      />
      {/* Horizontal Line */}
      {/* <div className="absolute left-2 top-2.5 h-px w-4 bg-gray-300" /> */}

      {/* Label + Badge */}
      <div className="flex justify-between items-center ml-2">
        {link ? (
          <Link href={link} className="hover:text-primary transition-colors">
            {name}
          </Link>
        ) : (
          <span>{name}</span>
        )}
       
      </div>
    </div>
  );

  // Group component for collapsible sections
  const Group = ({
    title,
    openKey,
    children,
  }: {
    title: string;
    openKey: keyof typeof openSections;
    children: React.ReactNode;
  }) => (
    <div className="mb-2">
      <div
        className="flex items-center gap-1 cursor-pointer text-foreground text-sm font-bold  hover:text-primary px-2 py-1 rounded transition-colors"
        onClick={() => toggleSection(openKey)}
      >
        {openSections[openKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </div>
      {openSections[openKey] && <div className="mt-1 ml-2">{children}</div>}
    </div>
  );
  // Content sidebar sections
  // const servicesSections = [
  //   {
  //     title: "Quiz & Practice Exams",
  //     items: [
  //       { icon: FileText, label: "Flashcards", link: "/pages/flashcards" },
  //       { icon: BarChart2, label: "Stats", link: "/course/result" },
  //       { icon: CheckSquare, label: "Assessments", link: "/course/Information-Mock-Assessment" },
  //     ],
  //   },
  //   {
  //     title: "Quiz",
  //     items: [
  //       { icon: FileQuestion, label: "Quiz", link: "/pages/test" },
     
  //     ],
  //   },
  //   {
  //     title: "Services",
  //     items: [
  //       { icon: FileText, label: "Flashcards", link: "/pages/flashcards" },
  //       { icon: BarChart2, label: "Stats", link: "/course/result" },
  //       { icon: CheckSquare, label: "Assessments", link: "/course/Information-Mock-Assessment" },
  //     ],
  //   },
  //   {
  //     title: "Features",
  //     items: [
  //       { icon: Bot, label: "AI Chatbot", link: "" },
  //       { icon: BookText, label: "Notes", link: "/course/notes" },
  //       { icon: MonitorPlay, label: "Tutorial", link: "/course/tutorial" },
  //     ],
  //   },
  // ]
  // const servicesSections = [
  //   
  //   {
  //     title: "Chats",
  //     key: "quiz",
  //     items: [
  //       { label: "All Chats", link: "/flow/chats" },
  //       
  //     ],
  //   },
  //   {
  //     title: "Services",
  //     key: "services",
  //     items: [
  //       { label: "Roles", link: "/flow/roles" },
  //       // { label: "Agents", link: "/flow/settings/teams" },
  //       { label: "Setup", link: "/flow/setup" },
  //       { label: "Knowledge Base", link: "/flow/knowledge",  badge: "new"  },
  //       { label: "Departments", link: "/flow/department",  badge: "new"  },
  //       { label: "Vector Database", link: "/flow/vector-database",  badge: "new"  },
  //       { label: "Configuration", link: "/flow/configuration",  badge: "new"  },
  //       { label: "All Settings", link: "/flow/all-settings",  badge: "new"  },
  //       { label: "Configuration", link: "/flow/configuration",  badge: "new"  },
  //     //  { label: "Settings", link: "/flow/settings",  badge: "new"  },

  //     ],
  //   },
  // ]
  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed bg-transparent top-[17px] left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="" size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className,
        )}
      >


        {/* Content Strip */}
        <div className="w-[240px] bg-background border-r border-border flex flex-col">
          {/* Logo */}
          {/* <div className="flex w-full justify-center items-center h-16 px-4"> */}
            <div className="flex  w-full justify-center items-center h-20">
            {/* <Image className="dark:hidden " src="/logo.svg" alt="Logo" width={150} height={150} />
          <Image className="hidden dark:block" src="/logo-white.png" alt="Logo" width={100} height={100} />
      */}
      <p className="text-xl font-bold text-green-500">WhatsAPP CRM</p>
            </div>
          {/* </div> */}

          {/* Services Navigation */}
          <div className="flex-1 px-4 pb-3 text-md space-y-4 overflow-y-auto">
            {servicesSections.map((section, sectionIndex) => (
              <Group key={sectionIndex} title={section.title} openKey={section.key as keyof typeof openSections}>
                {section.items.map((item, itemIndex) => (
                  <Item
                    key={itemIndex}
                    name={item.label}
                    isLast={itemIndex === section.items.length - 1}
                    badge={item.badge ? parseInt(item.badge) : undefined}
                    link={item.link}
                  />
                ))}
              </Group>
            ))}
            
            {/* Analytics section */}
            
            {/* Manage folders */}
            {/* <div className="mt-6 px-2 text-xs text-muted-foreground cursor-pointer hover:underline">
              Manage folders
            </div> */}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={toggleSidebar} />
      )}

      {/* Notification Modal */}
      <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
               clearSessionStorage()
               router.push("/auth/sign-in")
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen">
  
        <Sidebar />
        <main className="flex-1 md:ml-[230px]">
          <Topbar />
          <SupportModalProvider>{children}</SupportModalProvider>
        </main>
      </div>
    </ThemeProvider>
  )
}
