"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Plus, Trash2 } from "lucide-react"
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote("")
      setIsAdding(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            Session Notes
          </CardTitle>
          {!isAdding && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your practice notes..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote}>
                Save Note
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false)
                  setNewNote("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground">
            No notes yet. Add observations about your practice!
          </p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group flex items-start justify-between gap-2 rounded-lg bg-muted/50 p-3"
              >
                <div className="flex-1">
                  <p className="text-sm">{note.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteNote(note.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
