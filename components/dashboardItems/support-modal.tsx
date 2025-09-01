"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { CheckCircle2, MessageSquare, X } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// ===== Context =====
interface SupportModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const SupportModalContext = createContext<SupportModalContextType | undefined>(undefined)

// ===== Provider Component =====
export const SupportModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <SupportModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
      <SupportModal />
    </SupportModalContext.Provider>
  )
}

// ===== Hook =====
export const useSupportModal = () => {
  const context = useContext(SupportModalContext)
  if (context === undefined) {
    throw new Error("useSupportModal must be used within a SupportModalProvider")
  }
  return {
    openSupportModal: context.openModal,
  }
}

// ===== Modal Component =====
export const SupportModal = () => {
  const { isOpen, closeModal } = useContext(SupportModalContext)!
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [topic, setTopic] = useState("technical")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    setSubmitted(true)

    // Reset form after 3 seconds and close modal
    setTimeout(() => {
      setSubmitted(false)
      closeModal()
    }, 3000)
  }

  return (
    <div  className="m-4">
        <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className=" sm:max-w-[400px]">
        
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-purple-600" />
              Contact Support
            </CardTitle>
            <CardDescription className="text-xs">Fill out the form below to report an issue or get help with your account</CardDescription>
          </CardHeader>
          <CardContent className="px-0 text-xs pb-0">
            {submitted ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Message Sent!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Thank you for reaching out. Our support team will get back to you within 24 hours.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1 text-xs">
                  <Label className="text-xs" htmlFor="email">Your Email</Label>
                  <Input className="text-xs" id="email" type="email" placeholder="mk0906145@gmail.com" required />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="topic">Topic</Label>
                  <Select  defaultValue="technical" value={topic} onValueChange={setTopic}>
                    <SelectTrigger id="topic">
                      <SelectValue className="text-xs" placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="text-xs" value="technical">Technical Issue</SelectItem>
                      <SelectItem className="text-xs" value="billing">Billing Question</SelectItem>
                      <SelectItem className="text-xs" value="account">Account Help</SelectItem>
                      <SelectItem className="text-xs" value="course">Course Content</SelectItem>
                      <SelectItem className="text-xs" value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="subject">Subject</Label>
                  <Input className="text-xs" id="subject" placeholder="Brief description of your issue" required />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue in detail"
                    className=" text-xs min-h-[150px]"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full rounded-md bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
    </div>
    
  )
}
