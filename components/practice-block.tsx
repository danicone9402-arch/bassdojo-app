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

            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {block.duration_min} min
              </span>
              {block.target_bpm && (
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Target: {block.target_bpm} BPM
                </span>
              )}
            </div>

            {expanded && (
              <div className="mt-3 space-y-3">
                {block.description && (
                  <p className="text-sm text-muted-foreground">
                    {block.description}
                  </p>
                )}

                {block.target_bpm && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Achieved BPM"
                      value={bpmInput}
                      onChange={(e) => setBpmInput(e.target.value)}
                      className="h-8 w-28 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8"
                      onClick={handleBpmSave}
                    >
                      Save
                    </Button>
                    {block.achieved_bpm && (
                      <span className="text-xs text-primary">
                        Achieved: {block.achieved_bpm} BPM
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
