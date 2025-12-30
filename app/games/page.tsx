'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  playCount: number;
  status: 'available' | 'coming_soon' | 'locked';
  href?: string;
}

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: string;
  xp_reward: number;
}

// ============================================
// GAMES DATA
// ============================================

const GAMES: Game[] = [
  {
    id: 'trivia-daily',
    name: 'Daily Trivia',
    description: 'Test your spirits knowledge with 5 daily questions',
    icon: '🧠',
    category: 'Knowledge',
    difficulty: 'medium',
    xpReward: 100,
    playCount: 15234,
    status: 'available',
    href: '/games/trivia',
  },
  {
    id: 'blind-tasting',
    name: 'Blind Tasting',
    description: 'Identify spirits based on tasting notes alone',
    icon: '👃',
    category: 'Tasting',
    difficulty: 'hard',
    xpReward: 200,
    playCount: 8432,
    status: 'available',
    href: '/games/blind-tasting',
  },
  {
    id: 'price-guess',
    name: 'Price Is Right',
    description: 'Guess the market price of rare bottles',
    icon: '💰',
    category: 'Market',
    difficulty: 'medium',
    xpReward: 150,
    playCount: 12543,
    status: 'available',
    href: '/games/price-guess',
  },
  {
    id: 'label-match',
    name: 'Label Match',
    description: 'Match bottle labels to their spirits',
    icon: '🏷️',
    category: 'Visual',
    difficulty: 'easy',
    xpReward: 75,
    playCount: 9876,
    status: 'available',
    href: '/games/label-match',
  },
  {
    id: 'distillery-tour',
    name: 'Virtual Distillery Tour',
    description: 'Explore famous distilleries around the world',
    icon: '🏭',
    category: 'Education',
    difficulty: 'easy',
    xpReward: 50,
    playCount: 6543,
    status: 'available',
    href: '/games/distillery-tour',
  },
  {
    id: 'cocktail-challenge',
    name: 'Cocktail Challenge',
    description: 'Build classic cocktails step by step',
    icon: '🍹',
    category: 'Mixology',
    difficulty: 'medium',
    xpReward: 125,
    playCount: 11234,
    status: 'coming_soon',
  },
  {
    id: 'barrel-rush',
    name: 'Barrel Rush',
    description: 'Fast-paced barrel sorting arcade game',
    icon: '🛢️',
    category: 'Arcade',
    difficulty: 'medium',
    xpReward: 100,
    playCount: 0,
    status: 'coming_soon',
  },
  {
    id: 'spirit-wars',
    name: 'Spirit Wars',
    description: 'Multiplayer spirit comparison battles',
    icon: '⚔️',
    category: 'Multiplayer',
    difficulty: 'hard',
    xpReward: 300,
    playCount: 0,
    status: 'coming_soon',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'WhiskeyMaster', xp: 125000, avatar: '👨‍🍳', badge: '🏆' },
  { rank: 2, name: 'BourbonKing', xp: 98500, avatar: '🤠', badge: '🥈' },
  { rank: 3, name: 'ScotchLover', xp: 87200, avatar: '🧔', badge: '🥉' },
  { rank: 4, name: 'RumRunner', xp: 76400, avatar: '🏴‍☠️', badge: '' },
  { rank: 5, name: 'TequilaSunrise', xp: 65300, avatar: '🌵', badge: '' },
];

// ============================================
// GAMES HUB PAGE
// ============================================

export default function GamesHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [triviaComplete, setTriviaComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['all', ...new Set(GAMES.map(g => g.category))];
  const filteredGames = selectedCategory === 'all' 
    ? GAMES 
    : GAMES.filter(g => g.category === selectedCategory);

  // ============================================
  // TRIVIA FUNCTIONS
  // ============================================

  const startTrivia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games/trivia?count=5');
      const data = await response.json();
      
      if (data.success && data.questions) {
        setTriviaQuestions(data.questions);
        setShowTrivia(true);
        setCurrentQuestion(0);
        setScore(0);
        setTriviaComplete(false);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error('Failed to load trivia:', error);
      // Use fallback questions
      setTriviaQuestions([
        {
          id: '1',
          question: 'Which region of Scotland is known for heavily peated whiskies?',
          options: ['Speyside', 'Islay', 'Highland', 'Lowland'],
          correct_answer: 1,
          category: 'Scotch',
          difficulty: 'medium',
          xp_reward: 20,
        },
        {
          id: '2',
          question: 'What is the minimum aging requirement for Bourbon?',
          options: ['No minimum', '2 years', '4 years', '6 years'],
          correct_answer: 0,
          category: 'Bourbon',
          difficulty: 'medium',
          xp_reward: 20,
        },
        {
          id: '3',
          question: 'Tequila must be made from which type of agave?',
          options: ['Any agave', 'Blue Weber agave', 'Red agave', 'Wild agave'],
          correct_answer: 1,
          category: 'Tequila',
          difficulty: 'easy',
          xp_reward: 15,
        },
        {
          id: '4',
          question: 'What grain must Bourbon contain at least 51% of?',
          options: ['Wheat', 'Rye', 'Corn', 'Barley'],
          correct_answer: 2,
          category: 'Bourbon',
          difficulty: 'easy',
          xp_reward: 15,
        },
        {
          id: '5',
          question: 'Which cocktail traditionally uses Cognac, Cointreau, and lemon juice?',
          options: ['Margarita', 'Sidecar', 'Manhattan', 'Old Fashioned'],
          correct_answer: 1,
          category: 'Cocktails',
          difficulty: 'medium',
          xp_reward: 20,
        },
      ]);
      setShowTrivia(true);
      setCurrentQuestion(0);
      setScore(0);
      setTriviaComplete(false);
      setSelectedAnswer(null);
    }
    setLoading(false);
  };

  const submitAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const question = triviaQuestions[currentQuestion];
    
    if (answerIndex === question.correct_answer) {
      setScore(prev => prev + question.xp_reward);
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < triviaQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setTriviaComplete(true);
      }
    }, 1500);
  };

  const closeTrivia = () => {
    setShowTrivia(false);
    setTriviaQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTriviaComplete(false);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-2xl">🥃</span>
            <span className="font-bold">CravBarrels</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Games Hub</h1>
          <Link href="/rewards" className="flex items-center gap-2 text-amber-500">
            <span>🏆</span>
            <span className="font-medium">Rewards</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Play & Earn XP</h2>
              <p className="text-amber-100 max-w-lg">
                Test your spirits knowledge, compete with friends, and earn rewards 
                while having fun!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {GAMES.filter(g => g.status === 'available').length}
                </div>
                <div className="text-amber-200 text-sm">Games Available</div>
              </div>
              <div className="w-px h-12 bg-amber-500/50" />
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {GAMES.reduce((acc, g) => acc + g.playCount, 0).toLocaleString()}
                </div>
                <div className="text-amber-200 text-sm">Games Played</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'All Games' : category}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800 rounded-2xl p-6 border border-gray-700 ${
                    game.status === 'available' ? 'hover:border-amber-500/50 cursor-pointer' : 'opacity-60'
                  } transition-all`}
                  onClick={() => {
                    if (game.id === 'trivia-daily' && game.status === 'available') {
                      startTrivia();
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{game.icon}</div>
                    {game.status === 'coming_soon' && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                        Coming Soon
                      </span>
                    )}
                    {game.status === 'available' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        game.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        game.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {game.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">{game.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-500 font-medium">+{game.xpReward} XP</span>
                    {game.playCount > 0 && (
                      <span className="text-gray-500">
                        {game.playCount.toLocaleString()} plays
                      </span>
                    )}
                  </div>
                  {game.status === 'available' && (
                    <button 
                      className="w-full mt-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (game.id === 'trivia-daily') {
                          startTrivia();
                        } else if (game.href) {
                          window.location.href = game.href;
                        }
                      }}
                    >
                      Play Now
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Challenge */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚡</span>
                <div>
                  <h3 className="font-bold text-white">Daily Challenge</h3>
                  <p className="text-purple-200 text-sm">Resets in 12:34:56</p>
                </div>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Complete today's challenge to earn bonus XP and exclusive badges!
              </p>
              <button 
                onClick={startTrivia}
                className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
              >
                Start Challenge
              </button>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>🏆</span> Top Players
              </h3>
              <div className="space-y-3">
                {LEADERBOARD.map((player) => (
                  <div 
                    key={player.rank}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      player.rank <= 3 ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    <span className="text-lg w-6">{player.badge || player.rank}</span>
                    <span className="text-xl">{player.avatar}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{player.name}</div>
                      <div className="text-amber-500 text-xs">{player.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/leaderboard"
                className="block text-center text-amber-500 text-sm mt-4 hover:text-amber-400"
              >
                View Full Leaderboard →
              </Link>
            </div>

            {/* Your Stats */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Your Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Played</span>
                  <span className="text-white font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total XP Earned</span>
                  <span className="text-amber-500 font-medium">3,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400 font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-white font-medium">🔥 5 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trivia Modal */}
      <AnimatePresence>
        {showTrivia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
            >
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl animate-bounce mb-4">🧠</div>
                  <p className="text-white">Loading questions...</p>
                </div>
              ) : triviaComplete ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                  <p className="text-gray-400 mb-6">
                    You earned <span className="text-amber-500 font-bold">{score} XP</span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={startTrivia}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={closeTrivia}
                      className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : triviaQuestions.length > 0 ? (
                <>
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 text-sm">
                      Question {currentQuestion + 1} of {triviaQuestions.length}
                    </span>
                    <span className="text-amber-500 font-medium">
                      {score} XP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full mb-6">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${((currentQuestion + 1) / triviaQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  <h3 className="text-xl font-bold text-white mb-6">
                    {triviaQuestions[currentQuestion].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {triviaQuestions[currentQuestion].options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === triviaQuestions[currentQuestion].correct_answer;
                      const showResult = selectedAnswer !== null;

                      return (
                        <button
                          key={idx}
                          onClick={() => submitAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            showResult
                              ? isCorrect
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : isSelected
                                  ? 'bg-red-500/20 border-red-500 text-red-400'
                                  : 'bg-gray-700/50 border-gray-600 text-gray-400'
                              : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white'
                          } border`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                          {showResult && isCorrect && (
                            <span className="float-right">✓</span>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <span className="float-right">✗</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={closeTrivia}
                    className="mt-6 text-gray-500 hover:text-gray-400 text-sm"
                  >
                    Exit Quiz
                  </button>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
