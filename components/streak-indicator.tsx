"use client"

import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

interface StreakIndicatorProps {
  streak: number
  isActiveToday: boolean
}

export function StreakIndicator({ streak, isActiveToday }: StreakIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        isActiveToday ? "bg-orange-500/15" : "bg-muted"
      )}
    >
      <Flame
        className={cn(
          "h-4 w-4",
          isActiveToday
            ? "text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]"
            : "text-muted-foreground/50"
        )}
        fill={isActiveToday ? "currentColor" : "none"}
        strokeWidth={isActiveToday ? 1.5 : 2}
      />
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          isActiveToday ? "text-orange-500" : "text-muted-foreground/70"
        )}
      >
        {streak}
      </span>
    </div>
  )
}
