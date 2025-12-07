import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Hidden card discovery endpoint
export async function POST(request: NextRequest) {
  try {
    const { cardId, location, userId } = await request.json();

    if (!cardId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user already has this card
    const { data: existing } = await supabase
      .from('user_digital_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Card already discovered', alreadyDiscovered: true },
        { status: 409 }
      );
    }

    // Get card details
    const { data: card } = await supabase
      .from('hidden_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Check supply limits
    if (card.max_supply) {
      const { count } = await supabase
        .from('user_digital_cards')
        .select('id', { count: 'exact' })
        .eq('card_id', cardId);

      if (count && count >= card.max_supply) {
        return NextResponse.json(
          { error: 'Card supply exhausted', soldOut: true },
          { status: 410 }
        );
      }
    }

    // Award the card
    const instanceNumber = await getNextInstanceNumber(supabase, cardId);
    const isFoil = Math.random() < 0.05; // 5% chance for foil

    const { data: newCard, error: insertError } = await supabase
      .from('user_digital_cards')
      .insert({
        user_id: userId,
        card_id: cardId,
        discovered_at: new Date().toISOString(),
        discovery_location: location,
        instance_number: instanceNumber,
        is_foil: isFoil
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to award card:', insertError);
      return NextResponse.json(
        { error: 'Failed to award card' },
        { status: 500 }
      );
    }

    // Update user XP and credits
    await supabase.rpc('add_user_rewards', {
      p_user_id: userId,
      p_xp: card.xp_reward,
      p_credits: card.credit_reward
    });

    // Log the discovery event
    await supabase
      .from('discovery_events')
      .insert({
        user_id: userId,
        card_id: cardId,
        location,
        is_foil: isFoil,
        instance_number: instanceNumber
      });

    return NextResponse.json({
      success: true,
      card: {
        ...card,
        instanceNumber,
        isFoil
      },
      rewards: {
        xp: card.xp_reward,
        credits: card.credit_reward
      }
    });

  } catch (error) {
    console.error('Hidden cards API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's discovered cards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user's cards
    const { data: userCards, error } = await supabase
      .from('user_digital_cards')
      .select(`
        *,
        card:hidden_cards(*)
      `)
      .eq('user_id', userId)
      .order('discovered_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }

    // Get all available cards for progress tracking
    const { data: allCards } = await supabase
      .from('hidden_cards')
      .select('id, name, series, rarity, is_secret')
      .order('series');

    // Calculate stats
    const stats = {
      totalDiscovered: userCards?.length || 0,
      totalAvailable: allCards?.length || 0,
      xpEarned: userCards?.reduce((sum, c) => sum + (c.card?.xp_reward || 0), 0) || 0,
      creditsEarned: userCards?.reduce((sum, c) => sum + (c.card?.credit_reward || 0), 0) || 0,
      foilCount: userCards?.filter(c => c.is_foil).length || 0
    };

    return NextResponse.json({
      cards: userCards,
      allCards,
      stats
    });

  } catch (error) {
    console.error('Hidden cards GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getNextInstanceNumber(supabase: any, cardId: string): Promise<number> {
  const { count } = await supabase
    .from('user_digital_cards')
    .select('id', { count: 'exact' })
    .eq('card_id', cardId);
  
  return (count || 0) + 1;
}
