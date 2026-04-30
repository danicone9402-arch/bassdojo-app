"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { SessionCard } from "@/components/session-card"
import { SessionDetail } from "@/components/session-detail"
import { StreakIndicator } from "@/components/streak-indicator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Music2, Calendar, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Session, SessionWithBlocks } from "@/lib/types"

export default function HomePage() {
  const [todaySession, setTodaySession] = useState<Session | null>(null)
  const [selectedSession, setSelectedSession] = useState<SessionWithBlocks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [isTodayCompleted, setIsTodayCompleted] = useState(false)
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
    setIsTodayCompleted(data?.completed || false)
    setIsLoading(false)
  }

  const fetchStreak = async () => {
    // Get all completed sessions ordered by date descending
    const { data: sessions } = await supabase
      .from("sessions")
      .select("scheduled_date, completed")
      .eq("completed", true)
      .order("scheduled_date", { ascending: false })

    if (!sessions || sessions.length === 0) {
      setStreak(0)
      return
    }

    // Calculate streak - count consecutive days with completed sessions
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get unique dates (in case multiple sessions per day)
    const uniqueDates = [...new Set(sessions.map(s => s.scheduled_date))].sort().reverse()

    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = new Date(uniqueDates[i])
      sessionDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      expectedDate.setHours(0, 0, 0, 0)

      // Allow for yesterday to count if today not practiced yet
      if (i === 0) {
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > 1) break // Streak broken
        currentStreak++
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        prevDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > 1) break // Gap in streak
        currentStreak++
      }
    }

    setStreak(currentStreak)
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
    fetchStreak()
  }, [])

  const handleSessionClick = (session: Session) => {
    fetchSessionWithBlocks(session.id)
  }

  const handleBack = () => {
    setSelectedSession(null)
    fetchTodaySession()
    fetchStreak()
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
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
              onClick={() => { fetchTodaySession(); fetchStreak(); }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Streak */}
          <div className="mt-4 flex justify-center rounded-lg bg-card p-3">
            <StreakIndicator streak={streak} isActiveToday={isTodayCompleted} />
          </div>
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
