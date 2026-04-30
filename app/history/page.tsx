"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { SessionCard } from "@/components/session-card"
import { SessionDetail } from "@/components/session-detail"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">History</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            View all your practice sessions
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="mr-1 h-3.5 w-3.5" />
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sessions List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session.id} className="relative">
                <div className="absolute left-0 top-0 text-xs text-muted-foreground">
                  {new Date(session.scheduled_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="pt-5">
                  <SessionCard
                    session={session}
                    onClick={() => fetchSessionWithBlocks(session.id)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
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
