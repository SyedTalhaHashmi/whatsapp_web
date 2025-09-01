"use client" 
import React from "react";
import Link from "next/link";
import { ChevronDown , ChevronUp ,   User, Settings, LogOut, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getSessionStorageItem, clearSessionStorage } from "@/lib/utils";

interface MenuOption {
  icon: React.ReactNode;
  text: string;
  href: string;
}

const menuOptions: MenuOption[] = [
  // { icon: <User className="w-4 h-4 mr-2" />, text: "Chats", href: "/flow/chats" },
  // { icon: <Settings className="w-4 h-4 mr-2" />, text: "Settings", href: " /settings" },
  // { icon: <HelpCircle className="w-4 h-4 mr-2" />, text: "Help", href: "/help" },
  // Logout will be handled separately
];

export default function Topbar() {
  const [open, setOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const router = useRouter();

  const getUserName = () => {
    return getSessionStorageItem('userName')
  }

  return (
    <div className="flex items-center justify-end px-6 py-4 bg-white dark:bg-background relative">
      <div className="flex items-center cursor-pointer select-none" onClick={() => setOpen(!open)}>
        {open ? <ChevronUp className="w-6 h-6 text-gray-500  mx-2" /> : <ChevronDown className="w-6 h-6 text-gray-500  mx-2" />}
        <div className="h-8 w-8 rounded-full bg-green-800 flex items-center justify-center text-white mr-2">{getUserName()?.charAt(0)}</div>
          <span className="hidden md:inline text-sm text-gray-600 dark:text-white">{getUserName()}</span>
      </div>
      {open && (
        <div className="absolute right-6 top-16 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 z-50">
          {menuOptions.length > 0 && menuOptions.map((option, idx) => (
            <Link href={option.href} key={idx} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
              {option.icon}
              {option.text}
            </Link>
          ))}
          <button
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-background">
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
                clearSessionStorage()
                router.push('/auth/sign-in');
                setLogoutOpen(false);
                // Add your logout logic here
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 