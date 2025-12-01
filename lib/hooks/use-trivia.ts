'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TriviaQuestion, TriviaCategory, Difficulty, GameType } from '@/lib/types/database'

// Game modes configuration
export const GAME_MODES = [
  {
    id: 'quick' as GameType,
    name: 'Quick Play',
    icon: '⚡',
    description: '10 random questions, no time pressure',
    multiplier: 1,
    allowCategorySelect: true,
    allowDifficultySelect: false,
  },
  {
    id: 'timed' as GameType,
    name: 'Time Attack',
    icon: '⏱️',
    description: '30 seconds per question, beat the clock!',
    multiplier: 1.5,
    allowCategorySelect: true,
    allowDifficultySelect: true,
  },
  {
    id: 'expert' as GameType,
    name: 'Expert Challenge',
    icon: '🎯',
    description: 'Hard questions only, maximum rewards',
    multiplier: 2,
    allowCategorySelect: true,
    allowDifficultySelect: false,
  },
  {
    id: 'survival' as GameType,
    name: 'Survival Mode',
    icon: '💀',
    description: '3 strikes and you\'re out!',
    multiplier: 2.5,
    allowCategorySelect: false,
    allowDifficultySelect: false,
  },
]

// Category display information - ALL TriviaCategory values
export const CATEGORY_INFO: Record<TriviaCategory, { label: string; icon: string; color: string }> = {
  bourbon: { label: 'Bourbon', icon: '🥃', color: 'amber' },
  scotch: { label: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'amber' },
  irish: { label: 'Irish', icon: '☘️', color: 'green' },
  japanese: { label: 'Japanese', icon: '🇯🇵', color: 'red' },
  tequila: { label: 'Tequila', icon: '🌵', color: 'lime' },
  rum: { label: 'Rum', icon: '🏝️', color: 'orange' },
  gin: { label: 'Gin', icon: '🫒', color: 'teal' },
  cognac: { label: 'Cognac', icon: '🍇', color: 'purple' },
  general: { label: 'General', icon: '📚', color: 'blue' },
  production: { label: 'Production', icon: '🏭', color: 'stone' },
  history: { label: 'History', icon: '📜', color: 'amber' },
  wine: { label: 'Wine', icon: '🍷', color: 'red' },
  beer: { label: 'Beer', icon: '🍺', color: 'yellow' },
  vodka: { label: 'Vodka', icon: '🧊', color: 'slate' },
  sake: { label: 'Sake', icon: '🍶', color: 'white' },
  brands: { label: 'Brands', icon: '🏷️', color: 'blue' },
}

// Alias for backward compatibility
export const CATEGORY_DISPLAY = CATEGORY_INFO

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; multiplier: number; color: string }> = {
  easy: { label: 'Easy', multiplier: 1, color: 'green' },
  medium: { label: 'Medium', multiplier: 1.5, color: 'yellow' },
  hard: { label: 'Hard', multiplier: 2, color: 'orange' },
  expert: { label: 'Expert', multiplier: 3, color: 'red' },
}

interface TriviaState {
  questions: TriviaQuestion[]
  shuffledAnswersMap: Map<string, string[]>
  currentIndex: number
  score: number
  proofEarned: number
  answers: { questionId: string; answer: string; correct: boolean; timeMs: number }[]
  isComplete: boolean
  gameType: GameType | null
  startTime: Date | null
}

const initialState: TriviaState = {
  questions: [],
  shuffledAnswersMap: new Map(),
  currentIndex: 0,
  score: 0,
  proofEarned: 0,
  answers: [],
  isComplete: false,
  gameType: null,
  startTime: null,
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function useTrivia() {
  const [state, setState] = useState<TriviaState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const preprocessQuestions = useCallback((questions: TriviaQuestion[]): Map<string, string[]> => {
    const answersMap = new Map<string, string[]>()
    
    for (const question of questions) {
      let wrongAnswers: string[]
      if (typeof question.wrong_answers === 'string') {
        try {
          wrongAnswers = JSON.parse(question.wrong_answers)
        } catch {
          wrongAnswers = question.wrong_answers.split(',').map((a: string) => a.trim())
        }
      } else if (Array.isArray(question.wrong_answers)) {
        wrongAnswers = (question.wrong_answers as string[]).filter((a): a is string => typeof a === "string")
      } else {
        wrongAnswers = []
      }
      
      const allAnswers = [question.correct_answer, ...wrongAnswers]
      answersMap.set(question.id, shuffleArray(allAnswers))
    }
    
    return answersMap
  }, [])

  const startGame = useCallback(async (
    gameType: GameType,
    category?: TriviaCategory,
    difficulty?: Difficulty,
    limit = 10
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('bv_trivia_questions')
        .select('*')
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const shuffled = shuffleArray(data || []).slice(0, limit)
      const answersMap = preprocessQuestions(shuffled)

      setState({
        questions: shuffled,
        shuffledAnswersMap: answersMap,
        currentIndex: 0,
        score: 0,
        proofEarned: 0,
        answers: [],
        isComplete: false,
        gameType,
        startTime: new Date(),
      })
    } catch (err) {
      console.error('Error starting game:', err)
      setError('Failed to load questions')
    } finally {
      setIsLoading(false)
    }
  }, [preprocessQuestions])

  const submitAnswer = useCallback((answer: string) => {
    setState((prev) => {
      const currentQuestion = prev.questions[prev.currentIndex]
      if (!currentQuestion) return prev

      const isCorrect = answer === currentQuestion.correct_answer
      const proofReward = isCorrect ? (currentQuestion.proof_reward || 10) : 0

      const mode = GAME_MODES.find(m => m.id === prev.gameType)
      const multipliedProof = Math.round(proofReward * (mode?.multiplier || 1))

      const newAnswers = [
        ...prev.answers,
        {
          questionId: currentQuestion.id,
          answer,
          correct: isCorrect,
          timeMs: Date.now() - (prev.startTime?.getTime() || 0),
        },
      ]

      const isLastQuestion = prev.currentIndex >= prev.questions.length - 1

      return {
        ...prev,
        score: prev.score + (isCorrect ? 1 : 0),
        proofEarned: prev.proofEarned + multipliedProof,
        answers: newAnswers,
        currentIndex: isLastQuestion ? prev.currentIndex : prev.currentIndex + 1,
        isComplete: isLastQuestion,
      }
    })
  }, [])

  const currentQuestion = useMemo(() => {
    const question = state.questions[state.currentIndex]
    if (!question) return null

    const shuffledAnswers = state.shuffledAnswersMap.get(question.id) || []

    return {
      ...question,
      shuffledAnswers,
      questionNumber: state.currentIndex + 1,
      totalQuestions: state.questions.length,
    }
  }, [state.questions, state.currentIndex, state.shuffledAnswersMap])

  const saveGameSession = useCallback(async (userId?: string) => {
    if (state.questions.length === 0) return { success: false, error: new Error('No game to save') }

    try {
      const supabase = createClient()
      const { error: saveError } = await supabase.from('bv_game_sessions').insert({
        user_id: userId,
        game_type: state.gameType,
        total_questions: state.questions.length,
        correct_answers: state.score,
        proof_earned: state.proofEarned,
        completed_at: new Date().toISOString(),
      })

      if (saveError) throw saveError

      // Update user's proof balance if logged in
      if (userId && state.proofEarned > 0) {
        await supabase.rpc('add_proof', {
          p_user_id: userId,
          p_amount: state.proofEarned,
          p_type: 'earn',
          p_description: `Trivia game: ${state.score}/${state.questions.length} correct`,
        })
      }

      return { success: true }
    } catch (err) {
      console.error('Error saving game:', err)
      return { success: false, error: err }
    }
  }, [state])

  const resetGame = useCallback(() => {
    setState(initialState)
  }, [])

  const getGameStats = useCallback(() => {
    const totalQuestions = state.questions.length
    const correctAnswers = state.score
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      proofEarned: state.proofEarned,
      gameType: state.gameType,
    }
  }, [state])

  const progress = useMemo(() => {
    if (state.questions.length === 0) return 0
    return Math.round(((state.currentIndex + 1) / state.questions.length) * 100)
  }, [state.questions.length, state.currentIndex])

  return {
    questions: state.questions,
    score: state.score,
    proofEarned: state.proofEarned,
    answers: state.answers,
    isComplete: state.isComplete,
    isLoading,
    error,
    currentQuestion,
    startGame,
    submitAnswer,
    saveGameSession,
    resetGame,
    getGameStats,
    progress,
  }
}
