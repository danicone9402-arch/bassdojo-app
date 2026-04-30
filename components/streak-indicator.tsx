"use client"

import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

interface StreakIndicatorProps {
  streak: number
  isActiveToday: boolean
}

export function StreakIndicator({ streak, isActiveToday }: StreakIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "relative flex items-center justify-center",
          isActiveToday ? "text-orange-500" : "text-muted-foreground/50"
        )}
      >
        <Flame
          className={cn(
            "h-10 w-10 transition-all",
            isActiveToday && "drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
          )}
          fill={isActiveToday ? "currentColor" : "none"}
          strokeWidth={isActiveToday ? 1.5 : 2}
        />
        <span
          className={cn(
            "absolute text-xs font-bold",
            isActiveToday ? "text-white" : "text-muted-foreground"
          )}
        >
          {streak}
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-semibold",
            isActiveToday ? "text-orange-500" : "text-muted-foreground/70"
          )}
        >
          {streak} day{streak !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          {isActiveToday ? "Keep it up!" : "Practice to continue"}
        </span>
      </div>
    </div>
  )
}
