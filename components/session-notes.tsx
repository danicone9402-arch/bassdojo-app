"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SessionNote } from "@/lib/types"

interface SessionNotesProps {
  notes: SessionNote[]
  onAddNote: (content: string) => void
  onDeleteNote: (id: string) => void
}

export function SessionNotes({
  notes,
  onAddNote,
  onDeleteNote,
}: SessionNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote("")
      setIsAdding(false)
    }
  }

  return (
    <div className="border-t border-border pt-3">
      <button
        className="flex w-full items-center justify-between py-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-primary" />
          Notes
          {notes.length > 0 && (
            <span className="text-xs text-muted-foreground">({notes.length})</span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {notes.length === 0 && !isAdding && (
            <p className="text-xs text-muted-foreground py-2">
              No notes yet
            </p>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-start justify-between gap-2 rounded bg-muted/50 p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs">{note.content}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(note.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => onDeleteNote(note.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}

          {isAdding ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Write your practice notes..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[60px] resize-none text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleAddNote}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsAdding(false)
                    setNewNote("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Note
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
