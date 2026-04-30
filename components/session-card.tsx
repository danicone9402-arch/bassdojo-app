"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Session } from "@/lib/types"

interface SessionCardProps {
  session: Session
  onClick?: () => void
  showDate?: boolean
}

export function SessionCard({ session, onClick, showDate }: SessionCardProps) {
  return (
    <div
      className={cn(
        "flex cursor-pointer gap-3 rounded-lg bg-card p-3 transition-all active:scale-[0.98]",
        session.completed ? "opacity-60" : ""
      )}
      onClick={onClick}
    >
      {/* Status border */}
      <div
        className={cn(
          "w-1 shrink-0 rounded-full",
          session.completed ? "bg-primary/40" : "bg-primary"
        )}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{session.title}</h3>
              <Badge
                variant={session.completed ? "secondary" : "default"}
                className="shrink-0 text-[10px] px-1.5 py-0"
              >
                {session.completed ? "Done" : "Today"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Day {session.day} · {session.instrument} · {session.concept}
            </p>
          </div>
        </div>

        {showDate && (
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {new Date(session.scheduled_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  )
}
