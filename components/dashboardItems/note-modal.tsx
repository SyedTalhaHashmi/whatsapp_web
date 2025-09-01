"use client"

import { useState, useEffect, type FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Note {
  id: string,
  title: string,
  content: string
}
interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: any) => void
  note: Note | null
  isEditing: boolean
}

export default function NoteModal({ isOpen, onClose, onSave, note, isEditing }: NoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    } else {
      setTitle("")
      setContent("")
    }
  }, [note, isOpen])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) return

    if (isEditing && note) {
      onSave({
        id: note.id,
        title,
        content,
      })
    } else {
      onSave({
        title,
        content,
      })
    }

    setTitle("")
    setContent("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-background border border-gray-300 dark:border-gray-700 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Note" : "Add New Note"}</h2>
          <button onClick={onClose} className="p-1 rounded-full 0">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md  focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Note title"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              placeholder="Note content"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
