// 2026-09-05: table names corrected against the live schema.
//
// These are bv_-prefixed names for tables that exist WITHOUT the prefix. Each
// returned PostgREST 42P01 and failed the whole query, so every feature built
// on them returned nothing rather than something partial.
//
// Only prefix-strips whose target has an id and a substantial column set were
// applied. Eight other close-looking names were REJECTED: bv_distillery_views
// is not bv_distilleries, bv_lessons is not cv_lessons, and repointing those
// would swap a loud failure for a silent wrong answer.
import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

// Javari Spirits <-> Javari Cards Crossover API
// Allows shared users to access both platforms with single sign-on

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // 2026-09-04: identity from the token, never the query string.
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    switch (action) {
      case 'profile':
        // Get unified profile data
        const { data: profile } = await supabase
          .from('bv_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        return NextResponse.json({
          source: 'javarispirits',
          profile,
          crossover: {
            barrels: true,
            cards: true,  // Would check if user exists in cards DB
          }
        });

      case 'achievements':
        // Get achievements that could unlock rewards in Javari Cards
        const { data: achievements } = await supabase
          .from('bv_user_achievements')
          .select(`
            *,
            achievement:bv_achievements(name, icon, category)
          `)
          .eq('user_id', userId)
          .not('unlocked_at', 'is', null);

        return NextResponse.json({
          achievements,
          crossoverRewards: achievements?.map(a => ({
            achievement: a.achievement?.name,
            cardsBonus: calculateCardsBonus(a.achievement?.category)
          }))
        });

      case 'subscription':
        // Check if premium subscription can apply to Javari Cards
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        return NextResponse.json({
          subscription: sub,
          crossoverBenefits: sub?.plan !== 'free' ? {
            cardsDiscount: 20,  // 20% off Javari Cards premium
            sharedCredits: true,
            prioritySupport: sub?.plan === 'sommelier'
          } : null
        });

      default:
        return NextResponse.json({ 
          available_actions: ['profile', 'achievements', 'subscription'],
          message: 'Javari Spirits Crossover API v1.0'
        });
    }
  } catch (error) {
    console.error('Crossover API error:', error);
    return NextResponse.json({ error: 'Crossover request failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // user id deliberately not taken from the body.
    const {action, data} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    switch (action) {
      case 'sync_from_cards':
        // Receive data from Javari Cards to sync here
        // This would be called by Javari Cards when user links accounts
        const { cardsProfile, cardsAchievements } = data || {};
        
        // Could create crossover rewards or sync preferences
        return NextResponse.json({
          success: true,
          message: 'Data received from Javari Cards',
          synced: {
            profile: !!cardsProfile,
            achievements: cardsAchievements?.length || 0
          }
        });

      case 'link_accounts':
        // Link Javari Spirits account with Javari Cards
        // In production, this would verify with Javari Cards API
        return NextResponse.json({
          success: true,
          linkedAt: new Date().toISOString(),
          benefits: [
            '20% discount on Javari Cards premium',
            'Shared achievement rewards',
            'Unified profile',
            'Cross-platform notifications'
          ]
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Crossover POST error:', error);
    return NextResponse.json({ error: 'Crossover sync failed' }, { status: 500 });
  }
}

function calculateCardsBonus(category: string | undefined): number {
  const bonuses: Record<string, number> = {
    collection: 50,
    category: 25,
    reviews: 30,
    social: 20,
    distillery: 40,
    special: 100
  };
  return bonuses[category || ''] || 10;
}
