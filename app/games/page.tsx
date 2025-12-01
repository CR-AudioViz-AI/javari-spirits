'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useTrivia, GAME_MODES, CATEGORY_INFO, DIFFICULTY_INFO } from '@/lib/hooks/use-trivia'
import { useAuth } from '@/lib/hooks/use-auth'
import type { GameType, TriviaCategory, Difficulty } from '@/lib/types/database'

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
  
  // Use ref to track current question ID to prevent timer issues
  const currentQuestionIdRef = useRef<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Handle timeout - memoized to prevent recreating
  const handleTimeout = useCallback(() => {
    if (!currentQuestion || showResult) return
    setShowResult(true)
    setTimeout(() => {
      submitAnswer('__TIMEOUT__')
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeRemaining(30)
    }, 1500)
  }, [currentQuestion, showResult, submitAnswer])

  // Timer effect - only depends on question ID changing
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!isPlaying || showResult || !currentQuestion) return

    // Reset timer when question changes
    if (currentQuestionIdRef.current !== currentQuestion.id) {
      currentQuestionIdRef.current = currentQuestion.id
      setTimeRemaining(30)
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, showResult, currentQuestion?.id, handleTimeout])

  const handleStartGame = async () => {
    if (!selectedMode) return

    const mode = GAME_MODES.find((m) => m.id === selectedMode)
    if (!mode) return

    const category = mode.allowCategorySelect && selectedCategory !== 'all'
      ? selectedCategory
      : undefined

    const difficulty = mode.allowDifficultySelect
      ? selectedDifficulty
      : undefined

    currentQuestionIdRef.current = null
    setTimeRemaining(30)
    await startGame(selectedMode, category as TriviaCategory | undefined, difficulty)
  }

  const handleAnswer = useCallback((answer: string) => {
    if (showResult || !currentQuestion) return
    
    // Stop timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    setSelectedAnswer(answer)
    setShowResult(true)

    setTimeout(() => {
      submitAnswer(answer)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeRemaining(30)
    }, 1500)
  }, [showResult, currentQuestion, submitAnswer])

  const handlePlayAgain = () => {
    currentQuestionIdRef.current = null
    resetGame()
    setSelectedMode(null)
    setTimeRemaining(30)
  }

  const mode = selectedMode ? GAME_MODES.find((m) => m.id === selectedMode) : null
  const difficultyInfo = DIFFICULTY_INFO[selectedDifficulty]

  // Mode selection screen
  if (!isPlaying && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-amber-300 hover:text-amber-200">
              ← Back to Home
            </Link>
            {user && profile && (
              <div className="flex items-center gap-3 bg-stone-800/50 border border-amber-600/30 rounded-lg px-4 py-2">
                <span className="text-amber-400 font-bold">{profile.proof_balance || 0} $PROOF</span>
              </div>
            )}
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">🎮 Trivia Games</h1>
            <p className="text-xl text-amber-200">Test your spirits knowledge and earn $PROOF rewards</p>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Game Modes */}
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">Select Game Mode</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {GAME_MODES.map((gameMode) => (
                <button
                  key={gameMode.id}
                  onClick={() => setSelectedMode(gameMode.id)}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    selectedMode === gameMode.id
                      ? 'border-amber-500 bg-amber-600/20'
                      : 'border-stone-600 hover:border-amber-600/50 bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{gameMode.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold">{gameMode.name}</h3>
                      <p className="text-stone-400 text-sm mb-2">{gameMode.description}</p>
                      <span className="text-amber-400 text-sm">{gameMode.multiplier}x $PROOF</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category & Difficulty Selection */}
          {selectedMode && mode && (
            <div className="max-w-2xl mx-auto space-y-6">
              {mode.allowCategorySelect && (
                <div>
                  <h3 className="text-lg font-bold mb-3 text-center">Select Category</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`p-3 rounded-lg border text-sm ${
                        selectedCategory === 'all'
                          ? 'border-amber-500 bg-amber-600/20'
                          : 'border-stone-600 hover:border-amber-600/50'
                      }`}
                    >
                      All
                    </button>
                    {Object.entries(CATEGORY_INFO).map(([key, { label, icon }]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key as TriviaCategory)}
                        className={`p-3 rounded-lg border text-sm ${
                          selectedCategory === key
                            ? 'border-amber-500 bg-amber-600/20'
                            : 'border-stone-600 hover:border-amber-600/50'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode.allowDifficultySelect && (
                <div>
                  <h3 className="text-lg font-bold mb-3 text-center">Select Difficulty</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDifficulty(key as Difficulty)}
                        className={`p-3 rounded-lg border text-sm ${
                          selectedDifficulty === key
                            ? 'border-amber-500 bg-amber-600/20'
                            : 'border-stone-600 hover:border-amber-600/50'
                        }`}
                      >
                        {info.label}
                        <span className="block text-amber-400 text-xs">{info.multiplier}x</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleStartGame}
                disabled={loading}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 rounded-xl font-bold text-lg transition-colors"
              >
                {loading ? 'Loading...' : '🎮 Start Game'}
              </button>
            </div>
          )}

          {/* How to Play */}
          <div className="max-w-2xl mx-auto mt-16 bg-stone-800/50 border border-amber-600/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">How to Earn $PROOF</h2>
            <ul className="space-y-2 text-stone-300">
              <li>✓ Answer questions correctly to earn $PROOF tokens</li>
              <li>✓ Harder difficulties = more rewards</li>
              <li>✓ Build streaks for bonus points</li>
              <li>✓ Redeem $PROOF for real merchandise at the <Link href="/rewards" className="text-amber-400 hover:underline">Rewards Shop</Link></li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Game complete screen
  if (isComplete) {
    const stats = getGameStats()

    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">Game Complete!</h1>
            <p className="text-xl text-amber-200 mb-8">Great job testing your spirits knowledge</p>

            <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-8 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-stone-400 text-sm">Score</p>
                  <p className="text-3xl font-bold">{score}/{questions.length}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-sm">$PROOF Earned</p>
                  <p className="text-3xl font-bold text-amber-400">+{proofEarned}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-sm">Accuracy</p>
                  <p className="text-3xl font-bold">{stats.accuracy}%</p>
                </div>
                <div>
                  <p className="text-stone-400 text-sm">Best Streak</p>
                  <p className="text-3xl font-bold">{streak}🔥</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePlayAgain}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold"
              >
                Play Again
              </button>
              <Link
                href="/leaderboard"
                className="px-8 py-3 border border-amber-600 hover:bg-amber-600/10 rounded-lg font-semibold"
              >
                View Leaderboard
              </Link>
              <Link
                href="/rewards"
                className="px-8 py-3 border border-stone-600 hover:bg-stone-800 rounded-lg font-semibold"
              >
                Spend $PROOF
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active game screen
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-center">
        <div className="animate-spin text-5xl">🥃</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-stone-400">
              Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
            </span>
            <span className="text-amber-400 font-bold">{score} correct</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-bold ${
              timeRemaining <= 10 ? 'bg-red-600 animate-pulse' : 'bg-stone-800'
            }`}>
              ⏱️ {timeRemaining}s
            </div>
            <div className="bg-stone-800 px-4 py-2 rounded-lg">
              <span className="text-amber-400 font-bold">{proofEarned} $PROOF</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
              style={{ width: `${(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-8 mb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-sm bg-stone-700 text-stone-300">{difficultyInfo?.label}</span>
              <span className="text-amber-400 text-sm">+{(currentQuestion.proof_reward || 10) * (mode?.multiplier || 1)} $PROOF</span>
            </div>
            <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
          </div>

          {/* Answer Options - FIXED: Use question ID + option as key */}
          <div className="grid gap-3">
            {currentQuestion.shuffledAnswers.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === currentQuestion.correct_answer
              const showCorrect = showResult && isCorrect
              const showWrong = showResult && isSelected && !isCorrect

              return (
                <button
                  key={`${currentQuestion.id}-${index}`}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    showCorrect ? 'bg-green-600/30 border-green-500 text-green-100' :
                    showWrong ? 'bg-red-600/30 border-red-500 text-red-100' :
                    isSelected ? 'bg-amber-600/30 border-amber-500' :
                    'bg-stone-900/50 border-stone-700 hover:border-amber-600/50 hover:bg-stone-800/50'
                  } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
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
