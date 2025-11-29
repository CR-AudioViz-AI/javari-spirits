'use client'

// app/games/page.tsx
// BarrelVerse Games Page - REAL Database Integration

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useTrivia, CATEGORY_INFO, DIFFICULTY_INFO } from '@/lib/hooks/use-trivia'
import { useAuth } from '@/lib/hooks/use-auth'
import type { TriviaCategory, Difficulty, GameType } from '@/lib/types/database'

// Game modes using actual GameType values from database
const GAME_MODES: {
  id: GameType
  name: string
  description: string
  icon: string
  questionCount: number
  timeLimit: number
  multiplier: number
  allowCategorySelect?: boolean
}[] = [
  {
    id: 'quick_pour',
    name: 'Quick Pour',
    description: '10 random questions across all categories',
    icon: '⚡',
    questionCount: 10,
    timeLimit: 30,
    multiplier: 1,
  },
  {
    id: 'masters_challenge',
    name: 'Masters Challenge',
    description: '25 challenging questions for experts',
    icon: '🏆',
    questionCount: 25,
    timeLimit: 20,
    multiplier: 2,
  },
  {
    id: 'daily_dram',
    name: 'Daily Dram',
    description: 'Focus on one category of your choice',
    icon: '🎯',
    questionCount: 15,
    timeLimit: 25,
    multiplier: 1.5,
    allowCategorySelect: true,
  },
  {
    id: 'speed_round',
    name: 'Speed Round',
    description: 'Quick-fire questions with short time limits',
    icon: '⏱️',
    questionCount: 10,
    timeLimit: 15,
    multiplier: 1.5,
  },
]

export default function GamesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const {
    questions,
    score,
    proofEarned,
    answers,
    isComplete,
    isLoading: triviaLoading,
    error,
    currentQuestion,
    startGame,
    submitAnswer,
    resetGame,
    getGameStats,
    progress,
  } = useTrivia()

  const [selectedMode, setSelectedMode] = useState<GameType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<TriviaCategory | 'all'>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30)

  const loading = authLoading || triviaLoading
  const isPlaying = questions.length > 0 && !isComplete

  // Calculate streak from answers
  const streak = useMemo(() => {
    let maxStreak = 0
    let currentStreak = 0
    for (const answer of answers) {
      if (answer.correct) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    return maxStreak
  }, [answers])

  // Timer effect
  useEffect(() => {
    if (!isPlaying || showResult) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, showResult, currentQuestion])

  const handleStartGame = async () => {
    if (!selectedMode) return

    const mode = GAME_MODES.find((m) => m.id === selectedMode)
    if (!mode) return

    const category = mode.allowCategorySelect && selectedCategory !== 'all'
      ? selectedCategory
      : undefined

    await startGame(mode.id, category, selectedDifficulty, mode.questionCount)
    setTimeRemaining(mode.timeLimit)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswer = async (answer: string) => {
    if (showResult || !currentQuestion) return

    setSelectedAnswer(answer)
    setShowResult(true)

    const startTime = Date.now()
    await submitAnswer(answer, Date.now() - startTime)

    setTimeout(() => {
      setSelectedAnswer(null)
      setShowResult(false)
      const mode = GAME_MODES.find((m) => m.id === selectedMode)
      setTimeRemaining(mode?.timeLimit || 30)
    }, 1500)
  }

  const handleTimeout = () => {
    if (!currentQuestion) return
    handleAnswer('TIMEOUT')
  }

  const handleEndGame = () => {
    resetGame()
    setSelectedMode(null)
  }

  // Mode Selection Screen
  if (!isPlaying && !selectedMode && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center text-amber-300 hover:text-amber-200 mb-8">
            ← Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">🎮 Trivia Games</h1>
            <p className="text-xl text-amber-200">Test your spirits knowledge and earn $PROOF tokens!</p>
            {profile && (
              <p className="text-amber-300 mt-2">
                Your $PROOF Balance: {profile.proof_balance?.toLocaleString() || 0}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-6 text-left hover:border-amber-500 hover:bg-stone-800/70 transition-all group"
              >
                <div className="text-4xl mb-4">{mode.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-300">{mode.name}</h3>
                <p className="text-stone-400 mb-4">{mode.description}</p>
                <div className="flex gap-4 text-sm text-amber-400">
                  <span>📝 {mode.questionCount} questions</span>
                  <span>⏱️ {mode.timeLimit}s</span>
                  <span>💰 {mode.multiplier}x</span>
                </div>
              </button>
            ))}
          </div>

          {!user && (
            <div className="mt-8 text-center">
              <p className="text-amber-300 mb-4">Sign in to save your progress and earn $PROOF!</p>
              <Link href="/auth/login" className="inline-block bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Game Configuration Screen
  if (!isPlaying && selectedMode && !isComplete) {
    const mode = GAME_MODES.find((m) => m.id === selectedMode)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => setSelectedMode(null)} className="inline-flex items-center text-amber-300 hover:text-amber-200 mb-8">
            ← Choose Different Mode
          </button>

          <div className="max-w-xl mx-auto bg-stone-800/50 border border-amber-600/30 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{mode?.icon}</div>
              <h1 className="text-3xl font-bold mb-2">{mode?.name}</h1>
              <p className="text-stone-400">{mode?.description}</p>
            </div>

            {mode?.allowCategorySelect && (
              <div className="mb-6">
                <label className="block text-amber-300 mb-2 font-semibold">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TriviaCategory | 'all')}
                  className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.icon} {info.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-amber-300 mb-2 font-semibold">Difficulty</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDifficulty(key as Difficulty)}
                    className={`px-4 py-3 rounded-lg border transition-all ${selectedDifficulty === key ? 'bg-amber-600 border-amber-500 text-white' : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-amber-600/50'}`}
                  >
                    <div className="font-semibold">{info.label}</div>
                    <div className="text-xs opacity-75">{info.multiplier}x</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : '🎮 Start Game'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Game Results Screen
  if (isComplete) {
    const stats = getGameStats()
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto bg-stone-800/50 border border-amber-600/30 rounded-xl p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold mb-4">Game Complete!</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-stone-900/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-amber-400">{stats.score}/{stats.total}</div>
                <div className="text-stone-400">Correct</div>
              </div>
              <div className="bg-stone-900/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-amber-400">{stats.accuracy}%</div>
                <div className="text-stone-400">Accuracy</div>
              </div>
              <div className="bg-stone-900/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-400">{streak}🔥</div>
                <div className="text-stone-400">Best Streak</div>
              </div>
              <div className="bg-stone-900/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400">+{stats.proofEarned}</div>
                <div className="text-stone-400">$PROOF Earned</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleStartGame} className="flex-1 bg-amber-600 hover:bg-amber-700 py-3 px-6 rounded-lg font-semibold transition-colors">Play Again</button>
              <button onClick={handleEndGame} className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 px-6 rounded-lg font-semibold transition-colors">Choose Mode</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading State
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🥃</div>
          <p className="text-xl">Loading questions...</p>
        </div>
      </div>
    )
  }

  // Active Game Screen
  const mode = GAME_MODES.find((m) => m.id === selectedMode)
  const categoryInfo = CATEGORY_INFO[currentQuestion.category]
  const difficultyInfo = DIFFICULTY_INFO[currentQuestion.difficulty]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <span className="text-amber-300">Question {progress.current}/{progress.total}</span>
            <span className="bg-stone-800 px-3 py-1 rounded-full text-sm">{categoryInfo?.icon} {categoryInfo?.label}</span>
          </div>
          <button onClick={handleEndGame} className="text-stone-400 hover:text-white transition-colors">End Game</button>
        </div>

        <div className="w-full h-2 bg-stone-800 rounded-full mb-8">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{score}</div>
            <div className="text-stone-400 text-sm">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{streak}🔥</div>
            <div className="text-stone-400 text-sm">Streak</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeRemaining}s</div>
            <div className="text-stone-400 text-sm">Time</div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-8 mb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-sm bg-stone-700 text-stone-300">{difficultyInfo?.label}</span>
              <span className="text-amber-400 text-sm">+{currentQuestion.points * (mode?.multiplier || 1)} $PROOF</span>
            </div>
            <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === currentQuestion.correct_answer
              const showCorrect = showResult && isCorrect
              const showWrong = showResult && isSelected && !isCorrect

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${showCorrect ? 'bg-green-600/30 border-green-500 text-green-100' : showWrong ? 'bg-red-600/30 border-red-500 text-red-100' : isSelected ? 'bg-amber-600/30 border-amber-500' : 'bg-stone-900/50 border-stone-700 hover:border-amber-600/50 hover:bg-stone-800/50'} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-semibold mr-3 text-amber-400">{String.fromCharCode(65 + index)}.</span>
                  {option}
                  {showCorrect && <span className="float-right">✓</span>}
                  {showWrong && <span className="float-right">✗</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
