"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Brain,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Quiz } from "@/lib/types"

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchQuizzes = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .order("answered", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(20)

    setQuizzes(data || [])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const currentQuiz = quizzes[currentIndex]
  const isCorrect = selectedAnswer === currentQuiz?.correct_answer
  const answeredCount = quizzes.filter((q) => q.answered).length

  const handleSelectAnswer = async (answer: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(answer)

    await supabase
      .from("quizzes")
      .update({ answered: true, user_answer: answer })
      .eq("id", currentQuiz.id)

    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === currentQuiz.id ? { ...q, answered: true, user_answer: answer } : q
      )
    )
  }

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(quizzes[currentIndex + 1]?.user_answer || null)
      setShowExplanation(false)
    }
  }

  const handleReset = async () => {
    const quizIds = quizzes.map((q) => q.id)
    await supabase
      .from("quizzes")
      .update({ answered: false, user_answer: null })
      .in("id", quizIds)

    fetchQuizzes()
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="px-3 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Quiz</h1>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-lg bg-card p-4 text-center">
            <Brain className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No quizzes available</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Complete practice sessions to unlock quizzes
            </p>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {currentIndex + 1}/{quizzes.length}
                </span>
                <span className="text-primary font-medium">
                  {answeredCount} done
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${((currentIndex + 1) / quizzes.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Quiz */}
            <div className="rounded-lg bg-card p-3">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {currentQuiz.type}
                </Badge>
                {currentQuiz.answered && (
                  <Badge
                    variant={isCorrect ? "default" : "destructive"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {isCorrect ? "Correct" : "Wrong"}
                  </Badge>
                )}
              </div>

              <p className="text-sm font-medium leading-snug mb-4">
                {currentQuiz.question}
              </p>

              {/* Full-width tappable options */}
              <div className="space-y-2">
                {currentQuiz.options.map((option, i) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectOption = option === currentQuiz.correct_answer
                  const showResult = selectedAnswer !== null

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-all active:scale-[0.98]",
                        !showResult && "hover:border-primary/50 hover:bg-primary/5",
                        showResult && isCorrectOption && "border-primary bg-primary/10",
                        showResult && isSelected && !isCorrectOption && "border-destructive bg-destructive/10",
                        !showResult && isSelected && "border-primary bg-primary/10"
                      )}
                    >
                      <span className="flex-1">{option}</span>
                      {showResult && isCorrectOption && (
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {selectedAnswer && (
                <div className="mt-4">
                  {!showExplanation ? (
                    <button
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowExplanation(true)}
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      Show explanation
                    </button>
                  ) : (
                    <div className="rounded bg-muted/50 p-2.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {currentQuiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-3 flex justify-end">
              {currentIndex < quizzes.length - 1 && (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                >
                  Next
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Button>
              )}
              {currentIndex === quizzes.length - 1 && selectedAnswer && (
                <Button size="sm" className="h-8" onClick={handleReset} variant="secondary">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Restart
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
