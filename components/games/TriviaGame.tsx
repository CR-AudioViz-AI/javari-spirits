'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, CheckCircle, XCircle, Star, 
  Flame, Zap, HelpCircle, ArrowRight, RotateCcw,
  Award, Target, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface GameState {
  status: 'idle' | 'playing' | 'answered' | 'finished';
  currentQuestion: number;
  score: number;
  streak: number;
  maxStreak: number;
  timeLeft: number;
  answers: { correct: boolean; question: string }[];
}

const DIFFICULTY_POINTS = { easy: 10, medium: 20, hard: 30 };
const STREAK_BONUS = [0, 0, 5, 10, 15, 25, 40, 60, 80, 100];
const TIME_PER_QUESTION = 30;
const QUESTIONS_PER_GAME = 10;

export default function TriviaGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    currentQuestion: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    timeLeft: TIME_PER_QUESTION,
    answers: []
  });
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [highScores, setHighScores] = useState<number[]>([]);
  
  const supabase = createClient();

  // Load questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bv_trivia_questions')
        .select('*')
        .eq('is_active', true)
        .limit(50);
      
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      if (difficulty !== 'all') {
        query = query.eq('difficulty', difficulty);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Shuffle and take required number
      const shuffled = (data || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, QUESTIONS_PER_GAME);
      
      setQuestions(shuffled);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  }, [category, difficulty, supabase]);

  // Shuffle answers when question changes
  useEffect(() => {
    if (questions.length > 0 && gameState.currentQuestion < questions.length) {
      const q = questions[gameState.currentQuestion];
      const answers = [q.correct_answer, ...q.wrong_answers];
      setShuffledAnswers(answers.sort(() => Math.random() - 0.5));
      setSelectedAnswer(null);
    }
  }, [questions, gameState.currentQuestion]);

  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing' || gameState.timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Time's up - wrong answer
          handleAnswer(null);
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.status, gameState.timeLeft]);

  const startGame = async () => {
    await loadQuestions();
    setGameState({
      status: 'playing',
      currentQuestion: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      timeLeft: TIME_PER_QUESTION,
      answers: []
    });
  };

  const handleAnswer = (answer: string | null) => {
    if (gameState.status !== 'playing') return;
    
    const currentQ = questions[gameState.currentQuestion];
    const isCorrect = answer === currentQ.correct_answer;
    
    setSelectedAnswer(answer);
    
    // Calculate points
    let points = 0;
    let newStreak = gameState.streak;
    
    if (isCorrect) {
      points = DIFFICULTY_POINTS[currentQ.difficulty];
      // Time bonus
      points += Math.floor(gameState.timeLeft / 3);
      // Streak bonus
      newStreak = gameState.streak + 1;
      const streakBonus = STREAK_BONUS[Math.min(newStreak, STREAK_BONUS.length - 1)];
      points += streakBonus;
      
      if (newStreak >= 5) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      newStreak = 0;
    }
    
    setGameState(prev => ({
      ...prev,
      status: 'answered',
      score: prev.score + points,
      streak: newStreak,
      maxStreak: Math.max(prev.maxStreak, newStreak),
      answers: [...prev.answers, { correct: isCorrect, question: currentQ.question }]
    }));
    
    // Auto-advance after delay
    setTimeout(() => {
      if (gameState.currentQuestion >= questions.length - 1) {
        finishGame();
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      currentQuestion: prev.currentQuestion + 1,
      timeLeft: TIME_PER_QUESTION
    }));
  };

  const finishGame = async () => {
    setGameState(prev => ({ ...prev, status: 'finished' }));
    
    // Save score
    const newHighScores = [...highScores, gameState.score]
      .sort((a, b) => b - a)
      .slice(0, 5);
    setHighScores(newHighScores);
    
    // Big confetti for finishing
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Record game session
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('bv_game_sessions').insert({
          user_id: user.id,
          game_type: 'trivia',
          score: gameState.score,
          questions_answered: questions.length,
          correct_answers: gameState.answers.filter(a => a.correct).length,
          max_streak: gameState.maxStreak,
          duration_seconds: questions.length * TIME_PER_QUESTION - gameState.timeLeft
        });
        
        // Award proof points
        await supabase.rpc('add_proof_points', {
          p_user_id: user.id,
          p_points: Math.floor(gameState.score / 10),
          p_reason: 'Trivia game completion'
        });
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const currentQuestion = questions[gameState.currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-amber-400 text-xs uppercase">Score</p>
              <p className="text-2xl font-bold text-white">{gameState.score}</p>
            </div>
            {gameState.streak > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-bold">{gameState.streak}x</span>
              </motion.div>
            )}
          </div>
          
          {gameState.status === 'playing' && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className={`text-xl font-mono ${gameState.timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {gameState.timeLeft}s
              </span>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-amber-400 text-xs uppercase">Question</p>
            <p className="text-lg font-bold text-white">
              {gameState.currentQuestion + 1}/{questions.length || QUESTIONS_PER_GAME}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${((gameState.currentQuestion) / QUESTIONS_PER_GAME) * 100}%` }}
          />
        </div>
      </div>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        {gameState.status === 'idle' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-xl p-8 text-center"
          >
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Spirit Trivia Challenge</h2>
            <p className="text-gray-400 mb-6">
              Test your knowledge of whiskey, bourbon, scotch, and more!
            </p>
            
            {/* Filters */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="bourbon">Bourbon</option>
                  <option value="scotch">Scotch</option>
                  <option value="whiskey">Whiskey</option>
                  <option value="tequila">Tequila</option>
                  <option value="rum">Rum</option>
                  <option value="gin">Gin</option>
                  <option value="history">History</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={startGame}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Start Game'}
            </button>
            
            {/* High Scores */}
            {highScores.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm text-gray-400 mb-2">Your High Scores</h3>
                <div className="flex justify-center gap-4">
                  {highScores.slice(0, 3).map((score, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {i === 0 && <Star className="w-4 h-4 text-yellow-400" />}
                      <span className="text-white">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {(gameState.status === 'playing' || gameState.status === 'answered') && currentQuestion && (
          <motion.div
            key={`question-${gameState.currentQuestion}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            {/* Difficulty badge */}
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentQuestion.difficulty.toUpperCase()} • {DIFFICULTY_POINTS[currentQuestion.difficulty]} pts
              </span>
              <span className="text-gray-400 text-sm">{currentQuestion.category}</span>
            </div>
            
            {/* Question */}
            <h3 className="text-xl text-white font-medium mb-6">
              {currentQuestion.question}
            </h3>
            
            {/* Answers */}
            <div className="space-y-3">
              {shuffledAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === answer;
                const isCorrect = answer === currentQuestion.correct_answer;
                const showResult = gameState.status === 'answered';
                
                let buttonClass = 'bg-gray-700 hover:bg-gray-600 border-gray-600';
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = 'bg-green-500/20 border-green-500 text-green-400';
                  } else if (isSelected && !isCorrect) {
                    buttonClass = 'bg-red-500/20 border-red-500 text-red-400';
                  }
                }
                
                return (
                  <motion.button
                    key={answer}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => gameState.status === 'playing' && handleAnswer(answer)}
                    disabled={gameState.status !== 'playing'}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${buttonClass} disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">{answer}</span>
                      {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Explanation */}
            {gameState.status === 'answered' && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-300 text-sm">{currentQuestion.explanation}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {gameState.status === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 text-center"
          >
            <Award className="w-20 h-20 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Game Complete!</h2>
            
            <div className="text-5xl font-bold text-amber-400 my-6">
              {gameState.score}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">
                  {gameState.answers.filter(a => a.correct).length}/{questions.length}
                </p>
                <p className="text-xs text-gray-400">Correct</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{gameState.maxStreak}</p>
                <p className="text-xs text-gray-400">Best Streak</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">
                  +{Math.floor(gameState.score / 10)}
                </p>
                <p className="text-xs text-gray-400">Proof Earned</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGameState({ ...gameState, status: 'idle' })}
                className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
              >
                Leaderboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
