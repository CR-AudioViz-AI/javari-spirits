import { lazyAdminDb } from '@/lib/supabase/admin';
import { requireCaller } from '@/lib/api/caller';
import { NextRequest, NextResponse } from 'next/server';

const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const courseId = searchParams.get('id');

    // Get single course
    if (courseId) {
      const { data, error } = await supabase
        .from('bv_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        course: data
      });
    }

    // List courses
    let query = supabase
      .from('bv_courses')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      courses: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // user id deliberately not taken from the body.
    const {courseId, action} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Course ID required' },
        { status: 400 }
      );
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('bv_courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    if (action === 'complete') {
      // Record completion
      const { error: progressError } = await supabase
        .from('bv_user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (progressError) {
        // Table might not exist, continue anyway
        console.warn('Progress table issue:', progressError);
      }

      // Award proof points
      if (course.proof_reward) {
        await supabase.rpc('add_proof_points', {
          p_user_id: userId,
          p_points: course.proof_reward,
          p_reason: `Completed course: ${course.title}`
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Course completed!',
        proofAwarded: course.proof_reward || 0,
        badge: course.badge_reward
      });
    }

    if (action === 'start') {
      const { error: startError } = await supabase
        .from('bv_user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          started_at: new Date().toISOString()
        });

      return NextResponse.json({
        success: true,
        message: 'Course started'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Course action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process course action' },
      { status: 500 }
    );
  }
}
