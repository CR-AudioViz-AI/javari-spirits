import { lazyAdminDb } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('bv_trivia_questions')
      .select('*')
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    // Shuffle questions
    const shuffled = (data || []).sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      questions: shuffled,
      count: shuffled.length
    });
  } catch (error) {
    console.error('Trivia API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trivia questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, score, questionsAnswered, correctAnswers, maxStreak } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // Record game session
    const { data: session, error: sessionError } = await supabase
      .from('bv_game_sessions')
      .insert({
        user_id: userId,
        game_type: 'trivia',
        score,
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        max_streak: maxStreak
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Award proof points (1 point per 10 score)
    const proofPoints = Math.floor(score / 10);
    if (proofPoints > 0) {
      await supabase.rpc('add_proof_points', {
        p_user_id: userId,
        p_points: proofPoints,
        p_reason: 'Trivia game completion'
      });
    }

    // Check for achievements
    const achievements = [];
    
    if (correctAnswers >= 10) {
      achievements.push('trivia_master');
    }
    if (maxStreak >= 5) {
      achievements.push('on_fire');
    }
    if (score >= 500) {
      achievements.push('high_scorer');
    }

    return NextResponse.json({
      success: true,
      session,
      proofAwarded: proofPoints,
      achievements
    });
  } catch (error) {
    console.error('Trivia submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit game results' },
      { status: 500 }
    );
  }
}
