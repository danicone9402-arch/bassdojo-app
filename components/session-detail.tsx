"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PracticeBlock } from "./practice-block"
import { SessionNotes } from "./session-notes"
import { ArrowLeft, CheckCircle2, Brain, ChevronDown, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { SessionWithBlocks, SessionNote } from "@/lib/types"

interface SessionDetailProps {
  session: SessionWithBlocks
  onBack: () => void
}

export function SessionDetail({ session: initialSession, onBack }: SessionDetailProps) {
  const [session, setSession] = useState(initialSession)
  const [isSaving, setIsSaving] = useState(false)
  const [quizExpanded, setQuizExpanded] = useState(false)
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold truncate">{session.title}</h1>
            <Badge
              variant={session.completed ? "secondary" : "default"}
              className="text-[10px] px-1.5 py-0 shrink-0"
            >
              {session.completed ? "Done" : "In Progress"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Day {session.day} · {session.concept}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {completedBlocks}/{totalBlocks}
        </span>
      </div>

      {/* Practice Blocks */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground mb-1">Practice Blocks</h2>
        <div className="divide-y divide-border">
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
      </div>

      {/* Session Notes - Collapsible */}
      <SessionNotes
        notes={session.session_notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Quiz Section - Collapsible */}
      {session.quizzes && session.quizzes.length > 0 && (
        <div className="border-t border-border pt-3">
          <button
            className="flex w-full items-center justify-between py-1"
            onClick={() => setQuizExpanded(!quizExpanded)}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4 text-primary" />
              Quiz
              <span className="text-xs text-muted-foreground">
                ({session.quizzes.filter(q => q.answered).length}/{session.quizzes.length})
              </span>
            </span>
            {quizExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {quizExpanded && (
            <div className="mt-2 space-y-2">
              {session.quizzes.map((quiz, i) => (
                <div key={quiz.id} className="rounded bg-muted/50 p-2">
                  <p className="text-xs font-medium">Q{i + 1}: {quiz.question}</p>
                  {quiz.answered && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Answer: {quiz.user_answer}
                      {quiz.user_answer === quiz.correct_answer ? " ✓" : " ✗"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete Session Button */}
      {!session.completed && progress === 100 && (
        <Button
          className="w-full h-10"
          onClick={handleCompleteSession}
          disabled={isSaving}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Complete Session"}
        </Button>
      )}
    </div>
  )
}
