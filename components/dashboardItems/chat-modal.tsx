"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageSquare, Send, X, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ChatbotModal({
  triggerButtonText = "Chat with us",
  title = "AI Assistant",
}: {
  triggerButtonText?: string
  title?: string
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Add initial greeting message when chat is opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome-message",
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
        },
      ])
    }
  }, [open, messages.length])

  // Reset messages when modal closes
  useEffect(() => {
    if (!open) {
      setMessages([])
    }
  }, [open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate a short delay before bot responds
    setTimeout(() => {
      // Add hardcoded bot response
      const botMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: "Is there anything else I can help you with?",
      }

      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-sm font-bold rounded-mid">
         
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center py-4 justify-between">
            <DialogTitle>{title}</DialogTitle>
          
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                <p>How can I help you today?</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full",
                    message.role === "user" ? "bg-primary" : "bg-muted-foreground",
                  )}
                >
                  {message.role === "user" ? (
                    <User size={16} className="text-primary-foreground" />
                  ) : (
                    <Bot size={16} className="text-background" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex flex-col max-w-[80%] rounded-lg p-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted rounded-tl-none",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2 items-center">
          <input
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Mobile AI Assistant Chat Interface
export function ChatInterfaceMobile({ title = "AI Assistant" }: { title?: string }) {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Add initial greeting message when chat is opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-message",
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate a short delay before bot responds
    setTimeout(() => {
      // Add hardcoded bot response
      const botMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: "Is there anything else I can help you with?",
      }

      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="flex flex-col h-[60vh] bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="p-3 border-b font-bold text-base flex items-center gap-2">
        <Bot size={18} className="text-purple-600" />
        {title}
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-gray-400">
            <div>
              <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>How can I help you today?</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full",
                  message.role === "user" ? "bg-primary" : "bg-gray-200"
                )}
              >
                {message.role === "user" ? (
                  <User size={14} className="text-primary-foreground" />
                ) : (
                  <Bot size={14} className="text-purple-600" />
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col max-w-[75%] rounded-lg p-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-gray-100 rounded-tl-none text-gray-800"
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-2">
        <input
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}
