"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { SessionCard } from "@/components/session-card"
import { SessionDetail } from "@/components/session-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Session, SessionWithBlocks } from "@/lib/types"

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionWithBlocks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<"all" | "completed">("all")
  const supabase = createClient()

  const fetchSessions = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .order("scheduled_date", { ascending: false })

    setSessions(data || [])
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
    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter((session) => {
    if (tab === "completed") return session.completed
    return true
  })

  const handleBack = () => {
    setSelectedSession(null)
    fetchSessions()
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
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">History</h1>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-3">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sessions List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                showDate
                onClick={() => fetchSessionWithBlocks(session.id)}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Clock className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                No sessions found
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
