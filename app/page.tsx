"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { SessionCard } from "@/components/session-card"
import { SessionDetail } from "@/components/session-detail"
import { StreakIndicator } from "@/components/streak-indicator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Music2, RefreshCw } from "lucide-react"
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
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("scheduled_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching today session:", error)
    }
    setTodaySession(data)
    setIsTodayCompleted(data?.completed || false)
    setIsLoading(false)
  }

  const fetchStreak = async () => {
    const { data: sessions } = await supabase
      .from("sessions")
      .select("scheduled_date, completed")
      .eq("completed", true)
      .order("scheduled_date", { ascending: false })

    if (!sessions || sessions.length === 0) {
      setStreak(0)
      return
    }

    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get unique dates (in case multiple sessions per day)
    const uniqueDates: string[] = [...new Set(sessions.map((s: { scheduled_date: string }) => s.scheduled_date))].sort().reverse()

    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = new Date(uniqueDates[i])
      sessionDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      expectedDate.setHours(0, 0, 0, 0)

      if (i === 0) {
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > 1) break
        currentStreak++
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        prevDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > 1) break
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
      <main className="min-h-screen pb-16">
        <div className="px-3 py-4">
          <SessionDetail session={selectedSession} onBack={handleBack} />
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="px-3 py-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">BassDoJo</h1>
            <StreakIndicator streak={streak} isActiveToday={isTodayCompleted} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => { fetchTodaySession(); fetchStreak(); }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Today's Session */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {"Today's Session"}
          </h2>

          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : todaySession ? (
            <SessionCard
              session={todaySession}
              onClick={() => handleSessionClick(todaySession)}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Music2 className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                No session scheduled for today
              </p>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        {todaySession && (
          <section className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-card p-3 text-center">
              <p className="text-xl font-bold text-primary">Day {todaySession.day}</p>
              <p className="text-[10px] text-muted-foreground">Current Day</p>
            </div>
            <div className="rounded-lg bg-card p-3 text-center">
              <p className="text-xl font-bold text-accent">{todaySession.instrument}</p>
              <p className="text-[10px] text-muted-foreground">Instrument</p>
            </div>
          </section>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
