"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PracticeBlock } from "./practice-block"
import { SessionNotes } from "./session-notes"
import { ArrowLeft, Music, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { SessionWithBlocks, Block, SessionNote } from "@/lib/types"

interface SessionDetailProps {
  session: SessionWithBlocks
  onBack: () => void
}

export function SessionDetail({ session: initialSession, onBack }: SessionDetailProps) {
  const [session, setSession] = useState(initialSession)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const completedBlocks = session.blocks.filter((b) => b.completed).length
  const totalBlocks = session.blocks.length
  const progress = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0

  const handleToggleBlock = async (blockId: string, completed: boolean) => {
    setSession((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, completed } : b
      ),
    }))

    await supabase.from("blocks").update({ completed }).eq("id", blockId)
  }

  const handleUpdateBpm = async (blockId: string, bpm: number) => {
    setSession((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, achieved_bpm: bpm } : b
      ),
    }))

    await supabase.from("blocks").update({ achieved_bpm: bpm }).eq("id", blockId)
  }

  const handleAddNote = async (content: string) => {
    const { data, error } = await supabase
      .from("session_notes")
      .insert({ session_id: session.id, content })
      .select()
      .single()

    if (data && !error) {
      setSession((prev) => ({
        ...prev,
        session_notes: [...prev.session_notes, data as SessionNote],
      }))
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setSession((prev) => ({
      ...prev,
      session_notes: prev.session_notes.filter((n) => n.id !== noteId),
    }))

    await supabase.from("session_notes").delete().eq("id", noteId)
  }

  const handleCompleteSession = async () => {
    setIsSaving(true)
    await supabase
      .from("sessions")
      .update({ completed: true })
      .eq("id", session.id)
    
    setSession((prev) => ({ ...prev, completed: true }))
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">{session.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Day {session.day} - {session.concept}
          </p>
        </div>
        <Badge variant={session.completed ? "secondary" : "default"}>
          {session.completed ? "Completed" : "In Progress"}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{completedBlocks}/{totalBlocks} blocks</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Practice Blocks */}
      <div className="space-y-3">
        <h2 className="font-semibold">Practice Blocks</h2>
        {session.blocks
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => (
            <PracticeBlock
              key={block.id}
              block={block}
              onToggleComplete={handleToggleBlock}
              onUpdateBpm={handleUpdateBpm}
            />
          ))}
      </div>

      {/* Session Notes */}
      <SessionNotes
        notes={session.session_notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Complete Session Button */}
      {!session.completed && progress === 100 && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleCompleteSession}
          disabled={isSaving}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          {isSaving ? "Saving..." : "Complete Session"}
        </Button>
      )}
    </div>
  )
}
