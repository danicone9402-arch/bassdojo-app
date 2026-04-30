export interface Session {
  id: string
  day: number
  instrument: string
  title: string
  concept: string
  scheduled_date: string
  completed: boolean
  created_at: string
}

export interface Block {
  id: string
  session_id: string
  order_index: number
  duration_min: number
  title: string
  description: string
  target_bpm: number | null
  achieved_bpm: number | null
  completed: boolean
}

export interface SessionNote {
  id: string
  session_id: string
  content: string
  created_at: string
}

export interface Quiz {
  id: string
  session_id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  type: string
  answered: boolean
  user_answer: string | null
  created_at: string
}

export interface SessionWithBlocks extends Session {
  blocks: Block[]
  session_notes: SessionNote[]
  quizzes: Quiz[]
}
