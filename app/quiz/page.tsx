"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    // Fetch unanswered quizzes first, then answered ones
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

    // Update quiz in database
    await supabase
      .from("quizzes")
      .update({ answered: true, user_answer: answer })
      .eq("id", currentQuiz.id)

    // Update local state
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
    // Reset all quizzes to unanswered
    const quizIds = quizzes.map((q) => q.id)
    await supabase
      .from("quizzes")
      .update({ answered: false, user_answer: null })
      .in("id", quizIds)

    fetchQuizzes()
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Quiz</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Test your music theory knowledge
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No quizzes available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete practice sessions to unlock theory quizzes
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentIndex + 1} of {quizzes.length}
                </span>
                <span className="text-primary font-medium">
                  {answeredCount} answered
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${((currentIndex + 1) / quizzes.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Quiz Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentQuiz.type}
                  </Badge>
                  {currentQuiz.answered && (
                    <Badge variant={isCorrect ? "default" : "destructive"}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-snug mt-2">
                  {currentQuiz.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                        "w-full rounded-lg border p-3 text-left text-sm transition-all",
                        "hover:border-primary/50 hover:bg-primary/5",
                        showResult && isCorrectOption && "border-primary bg-primary/10",
                        showResult && isSelected && !isCorrectOption && "border-destructive bg-destructive/10",
                        !showResult && isSelected && "border-primary bg-primary/10"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{option}</span>
                        {showResult && isCorrectOption && (
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}

                {/* Explanation */}
                {selectedAnswer && (
                  <div className="pt-2">
                    {!showExplanation ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowExplanation(true)}
                      >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Show Explanation
                      </Button>
                    ) : (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">
                          {currentQuiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="mt-4 flex justify-end">
              {currentIndex < quizzes.length - 1 && (
                <Button onClick={handleNext} disabled={!selectedAnswer}>
                  Next Question
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              {currentIndex === quizzes.length - 1 && selectedAnswer && (
                <Button onClick={handleReset} variant="secondary">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart Quiz
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
