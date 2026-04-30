"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp, Clock, CheckCircle2, Gauge } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import type { Session, Block } from "@/lib/types"

interface Stats {
  totalSessions: number
  completedSessions: number
  totalPracticeTime: number
  avgBpmImprovement: number
  weeklyData: { day: string; minutes: number }[]
  bpmProgress: { session: string; target: number; achieved: number }[]
}

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = async () => {
    setIsLoading(true)

    // Fetch sessions and blocks
    const [sessionsRes, blocksRes] = await Promise.all([
      supabase.from("sessions").select("*").order("scheduled_date"),
      supabase.from("blocks").select("*"),
    ])

    const sessions = sessionsRes.data || []
    const blocks = blocksRes.data || []

    // Calculate stats
    const completedSessions = sessions.filter((s) => s.completed).length
    const totalPracticeTime = blocks
      .filter((b) => b.completed)
      .reduce((acc, b) => acc + (b.duration_min || 0), 0)

    // Calculate BPM improvements
    const blocksWithBpm = blocks.filter((b) => b.target_bpm && b.achieved_bpm)
    const avgBpmImprovement =
      blocksWithBpm.length > 0
        ? blocksWithBpm.reduce(
            (acc, b) => acc + (b.achieved_bpm! - b.target_bpm!),
            0
          ) / blocksWithBpm.length
        : 0

    // Weekly practice data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    const weeklyData = last7Days.map((date) => {
      const daySessions = sessions.filter((s) => s.scheduled_date === date && s.completed)
      const sessionIds = daySessions.map((s) => s.id)
      const dayBlocks = blocks.filter(
        (b) => sessionIds.includes(b.session_id) && b.completed
      )
      const minutes = dayBlocks.reduce((acc, b) => acc + (b.duration_min || 0), 0)
      return {
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        minutes,
      }
    })

    // BPM progress for last 5 sessions with BPM tracking
    const sessionsWithBpm = sessions
      .filter((s) => {
        const sessionBlocks = blocks.filter(
          (b) => b.session_id === s.id && b.target_bpm
        )
        return sessionBlocks.length > 0
      })
      .slice(-5)

    const bpmProgress = sessionsWithBpm.map((s) => {
      const sessionBlocks = blocks.filter(
        (b) => b.session_id === s.id && b.target_bpm
      )
      const avgTarget =
        sessionBlocks.reduce((acc, b) => acc + (b.target_bpm || 0), 0) /
        sessionBlocks.length
      const avgAchieved =
        sessionBlocks.filter((b) => b.achieved_bpm).length > 0
          ? sessionBlocks
              .filter((b) => b.achieved_bpm)
              .reduce((acc, b) => acc + (b.achieved_bpm || 0), 0) /
            sessionBlocks.filter((b) => b.achieved_bpm).length
          : 0
      return {
        session: `Day ${s.day}`,
        target: Math.round(avgTarget),
        achieved: Math.round(avgAchieved),
      }
    })

    setStats({
      totalSessions: sessions.length,
      completedSessions,
      totalPracticeTime,
      avgBpmImprovement: Math.round(avgBpmImprovement),
      weeklyData,
      bpmProgress,
    })
    setIsLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Progress</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your practice journey
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs">Completed</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {stats.completedSessions}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{stats.totalSessions}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Total Time</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {stats.totalPracticeTime}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}min
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Completion</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {stats.totalSessions > 0
                      ? Math.round(
                          (stats.completedSessions / stats.totalSessions) * 100
                        )
                      : 0}
                    <span className="text-sm font-normal text-muted-foreground">
                      %
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    <span className="text-xs">Avg BPM +/-</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {stats.avgBpmImprovement >= 0 ? "+" : ""}
                    {stats.avgBpmImprovement}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}BPM
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Practice Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weeklyData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "var(--color-foreground)" }}
                      />
                      <Bar
                        dataKey="minutes"
                        fill="var(--color-primary)"
                        radius={[4, 4, 0, 0]}
                        name="Minutes"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* BPM Progress Chart */}
            {stats.bpmProgress.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">BPM Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.bpmProgress}>
                        <XAxis
                          dataKey="session"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "var(--color-foreground)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="target"
                          stroke="var(--color-muted-foreground)"
                          fill="var(--color-muted)"
                          strokeWidth={2}
                          name="Target BPM"
                        />
                        <Area
                          type="monotone"
                          dataKey="achieved"
                          stroke="var(--color-primary)"
                          fill="var(--color-primary)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                          name="Achieved BPM"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
      <BottomNav />
    </main>
  )
}
