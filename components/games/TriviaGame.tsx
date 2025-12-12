'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

interface TriviaQuestion {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: string;
  proof_reward: number;
  explanation: string;
}

interface GameState {
  questions: TriviaQuestion[];
  currentIndex: number;
  score: number;
  proofEarned: number;
  streak: number;
  answers: { questionId: string; correct: boolean; answer: string }[];
  timeLeft: number;
  isComplete: boolean;
}

export default function TriviaGame({ 
  category = 'all',
  questionCount = 10 
}: { 
  category?: string;
  questionCount?: number;
}) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  useEffect(() => {
    startGame();
  }, [category, questionCount]);

  const startGame = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games/trivia?category=${category}&count=${questionCount}`);
      const data = await res.json();
      
      if (data.questions?.length > 0) {
        setGameState({
          questions: data.questions,
          currentIndex: 0,
          score: 0,
          proofEarned: 0,
          streak: 0,
          answers: [],
          timeLeft: 30,
          isComplete: false
        });
        shuffleAnswers(data.questions[0]);
      }
    } catch (error) {
      console.error('Failed to load trivia:', error);
    }
    setLoading(false);
  };

  const shuffleAnswers = (question: TriviaQuestion) => {
    const answers = [...question.wrong_answers, question.correct_answer];
    setShuffledAnswers(answers.sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (answer: string) => {
    if (showResult || !gameState) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const currentQuestion = gameState.questions[gameState.currentIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    const streakBonus = isCorrect ? Math.min(gameState.streak, 5) : 0;
    const proofEarned = isCorrect ? currentQuestion.proof_reward + streakBonus : 0;
    
    setGameState(prev => prev ? {
      ...prev,
      score: prev.score + (isCorrect ? 1 : 0),
      proofEarned: prev.proofEarned + proofEarned,
      streak: isCorrect ? prev.streak + 1 : 0,
      answers: [...prev.answers, {
        questionId: currentQuestion.id,
        correct: isCorrect,
        answer
      }]
    } : null);
  };

  const nextQuestion = () => {
    if (!gameState) return;
    
    const nextIndex = gameState.currentIndex + 1;
    
    if (nextIndex >= gameState.questions.length) {
      setGameState(prev => prev ? { ...prev, isComplete: true } : null);
      saveGameResults();
    } else {
      setGameState(prev => prev ? { ...prev, currentIndex: nextIndex } : null);
      shuffleAnswers(gameState.questions[nextIndex]);
    }
    
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const saveGameResults = async () => {
    if (!gameState) return;
    try {
      await fetch('/api/games/trivia/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: gameState.score,
          total: gameState.questions.length,
          proofEarned: gameState.proofEarned,
          category
        })
      });
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading trivia questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!gameState || gameState.questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No questions available for this category.</p>
          <Button onClick={startGame}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState.isComplete) {
    const percentage = Math.round((gameState.score / gameState.questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-amber-500 mb-4" />
          <CardTitle className="text-2xl">Game Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-600">{gameState.score}/{gameState.questions.length}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">+{gameState.proofEarned}</div>
              <div className="text-sm text-muted-foreground">Proof Earned</div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={startGame} className="bg-amber-600 hover:bg-amber-700">
              Play Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/games'}>
              More Games
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentIndex];
  const progress = ((gameState.currentIndex + 1) / gameState.questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="capitalize">{currentQuestion.category}</Badge>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              {gameState.streak} streak
            </span>
            <span className="text-sm font-medium">
              {gameState.currentIndex + 1} / {gameState.questions.length}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Badge className={`mb-3 ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-500' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {currentQuestion.difficulty} • +{currentQuestion.proof_reward} proof
          </Badge>
          <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>
        </div>

        <div className="grid gap-3">
          {shuffledAnswers.map((answer, idx) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === currentQuestion.correct_answer;
            
            let buttonClass = "w-full justify-start text-left h-auto py-4 px-4";
            if (showResult) {
              if (isCorrect) {
                buttonClass += " bg-green-100 border-green-500 text-green-800";
              } else if (isSelected && !isCorrect) {
                buttonClass += " bg-red-100 border-red-500 text-red-800";
              }
            }
            
            return (
              <Button
                key={idx}
                variant="outline"
                className={buttonClass}
                onClick={() => handleAnswer(answer)}
                disabled={showResult}
              >
                <span className="flex items-center gap-2">
                  {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                  {answer}
                </span>
              </Button>
            );
          })}
        </div>

        {showResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              selectedAnswer === currentQuestion.correct_answer ? 'bg-green-50' : 'bg-amber-50'
            }`}>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
            <Button onClick={nextQuestion} className="w-full bg-amber-600 hover:bg-amber-700">
              {gameState.currentIndex + 1 >= gameState.questions.length ? 'See Results' : 'Next Question'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
