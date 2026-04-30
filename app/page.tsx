"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { SessionCard } from "@/components/session-card"
import { SessionDetail } from "@/components/session-detail"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Music2, Calendar, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Session, SessionWithBlocks } from "@/lib/types"

export default function HomePage() {
  const [todaySession, setTodaySession] = useState<Session | null>(null)
  const [selectedSession, setSelectedSession] = useState<SessionWithBlocks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchTodaySession = async () => {
    setIsLoading(true)
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("scheduled_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    setTodaySession(data)
    setIsLoading(false)
  }

  const fetchSessionWithBlocks = async (sessionId: string) => {
    const [sessionRes, blocksRes, notesRes, quizzesRes] = await Promise.all([
      supabase.from("sessions").select("*").eq("id", sessionId).single(),
      supabase.from("blocks").select("*").eq("session_id", sessionId).order("order_index"),
      supabase.from("session_notes").select("*").eq("session_id", sessionId).order("created_at"),
      supabase.from("quizzes").select("*").eq("session_id", sessionId),
    ])

    if (sessionRes.data) {
      setSelectedSession({
        ...sessionRes.data,
        blocks: blocksRes.data || [],
        session_notes: notesRes.data || [],
        quizzes: quizzesRes.data || [],
      })
    }
  }

  useEffect(() => {
    fetchTodaySession()
  }, [])

  const handleSessionClick = (session: Session) => {
    fetchSessionWithBlocks(session.id)
  }

  const handleBack = () => {
    setSelectedSession(null)
    fetchTodaySession()
  }

  if (selectedSession) {
    return (
      <main className="min-h-screen pb-20">
        <div className="mx-auto max-w-md px-4 py-6">
          <SessionDetail session={selectedSession} onBack={handleBack} />
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Music2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">BassDoJo</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTodaySession}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Today's Session */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Calendar className="h-4 w-4 text-primary" />
            {"Today's Session"}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : todaySession ? (
            <SessionCard
              session={todaySession}
              onClick={() => handleSessionClick(todaySession)}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Music2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No session scheduled for today
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check the History tab for upcoming sessions
              </p>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        {todaySession && (
          <section className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                Day {todaySession.day}
              </p>
              <p className="text-xs text-muted-foreground">Current Day</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {todaySession.instrument}
              </p>
              <p className="text-xs text-muted-foreground">Instrument</p>
            </div>
          </section>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
