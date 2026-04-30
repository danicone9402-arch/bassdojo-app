"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Gauge, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/types"

interface PracticeBlockProps {
  block: Block
  onToggleComplete: (id: string, completed: boolean) => void
  onUpdateBpm: (id: string, bpm: number) => void
}

export function PracticeBlock({
  block,
  onToggleComplete,
  onUpdateBpm,
}: PracticeBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const [bpmInput, setBpmInput] = useState(block.achieved_bpm?.toString() || "")

  const handleBpmSave = () => {
    const bpm = parseInt(bpmInput)
    if (!isNaN(bpm) && bpm > 0) {
      onUpdateBpm(block.id, bpm)
    }
  }

  return (
    <div
      className={cn(
        "py-3",
        block.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={block.completed}
          onCheckedChange={(checked) =>
            onToggleComplete(block.id, checked as boolean)
          }
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={cn(
                "text-sm font-medium leading-tight",
                block.completed && "line-through text-muted-foreground"
              )}
            >
              {block.title}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              {block.target_bpm && expanded && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="BPM"
                    value={bpmInput}
                    onChange={(e) => setBpmInput(e.target.value)}
                    onBlur={handleBpmSave}
                    className="h-6 w-16 text-xs px-1.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-0.5 flex items-center gap-2.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {block.duration_min}m
            </span>
            {block.target_bpm && (
              <span className="flex items-center gap-0.5">
                <Gauge className="h-3 w-3" />
                {block.target_bpm} BPM
                {block.achieved_bpm && (
                  <span className="text-primary ml-1">({block.achieved_bpm})</span>
                )}
              </span>
            )}
          </div>

          {expanded && block.description && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {block.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
