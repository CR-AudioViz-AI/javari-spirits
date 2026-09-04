// app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // 2026-09-04: identity from the token, never the query string.
  const _c = await requireCaller(request);
  if (!_c.ok) return _c.res;
  const userId = _c.userId;
  const type = searchParams.get('type') || 'following'; // 'following', 'global', 'user'
  const targetUserId = searchParams.get('targetUserId');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabase
      .from('bv_activities')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, display_name),
        spirit:bv_spirits(id, name, brand, image_url, category),
        cocktail:bv_cocktails(id, name, image_url),
        distillery:bv_distilleries(id, name, image_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type === 'following' && userId) {
      // Get following IDs
      const { data: following } = await supabase
        .from('bv_follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(userId); // Include own activities
      
      query = query.in('user_id', followingIds);
    } else if (type === 'user' && targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: activities, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new activity
export async function POST(request: NextRequest) {
  try {
    // user id deliberately not taken from the body.
    const {activityType, spiritId, cocktailId, distilleryId, content, metadata, isPublic} = await request.json();
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!userId || !activityType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bv_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        spirit_id: spiritId,
        cocktail_id: cocktailId,
        distillery_id: distilleryId,
        metadata,
        is_public: isPublic !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
