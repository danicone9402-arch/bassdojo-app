"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Clock, Target } from "lucide-react"
import type { Session } from "@/lib/types"

interface SessionCardProps {
  session: Session
  onClick?: () => void
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        session.completed ? "opacity-70" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Music className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{session.title}</CardTitle>
              <p className="text-xs text-muted-foreground">Day {session.day}</p>
            </div>
          </div>
          <Badge variant={session.completed ? "secondary" : "default"}>
            {session.completed ? "Done" : "Today"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            <span>{session.concept}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{session.instrument}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
