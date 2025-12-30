import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering to avoid static build errors
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 50);

    let query = supabase
      .from('bv_trivia_questions')
      .select('id, question, correct_answer, wrong_answers, category, difficulty, proof_reward, explanation')
      .eq('is_active', true);

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: questions, error } = await query.limit(count * 3);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const shuffled = questions?.sort(() => Math.random() - 0.5).slice(0, count) || [];

    return NextResponse.json({ 
      questions: shuffled,
      total: shuffled.length,
      category 
    });
  } catch (error) {
    console.error('Trivia API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trivia questions' }, { status: 500 });
  }
}
