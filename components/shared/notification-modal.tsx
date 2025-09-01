"use client"

import { MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
              <Image
                src="/achievement.png"
                alt="Achievement"
                width={40}
                height={40}
                className="rounded-md"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">You&apos;ve studied 3 sets! You&apos;ve earned set stacker status.</p>
                  <p className="text-sm text-muted-foreground">5 days ago</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button variant="link" className="px-0 h-auto text-primary">
                View all achievements
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <Image
               src="/achievement.png"
                alt="Homework"
                width={40}
                height={40}
                className="rounded-md"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">
                    Double check your Engineering homework with expert-verified solutions.
                  </p>
                  <p className="text-sm text-muted-foreground">3 weeks ago</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button variant="link" className="px-0 h-auto text-primary">
                Search for your textbook
              </Button>
            </div>
          </div>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-card-foreground">CompTIA A+ 220-1102 (Core 2)</h3>
                  <p className="text-sm text-muted-foreground">Flashcard set • 50 terms • by ITUlearning</p>
                </div>
                <Image
                 src="/achievement.png"
                  alt="Flashcard"
                  width={50}
                  height={50}
                  className="rounded-md"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 