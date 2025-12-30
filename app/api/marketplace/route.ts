import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const dynamic = 'force-dynamic';

// Platform fee percentage (5%)
const PLATFORM_FEE = 0.05;

// GET /api/marketplace - Fetch listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const search = searchParams.get('search');
    const sellerId = searchParams.get('seller_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('bv_marketplace_listings')
      .select(`
        *,
        seller:bv_profiles!seller_id (
          id,
          username,
          avatar_url,
          seller_rating,
          total_trades
        ),
        spirit:bv_spirits!spirit_id (
          id,
          name,
          brand,
          category,
          image_url
        )
      `)
      .eq('status', 'active')
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type !== 'all') {
      query = query.eq('listing_type', type);
    }

    if (category) {
      query = query.eq('spirit.category', category);
    }

    if (condition && condition !== 'all') {
      query = query.eq('condition', condition);
    }

    if (priceMin) {
      query = query.gte('price', parseInt(priceMin));
    }

    if (priceMax) {
      query = query.lte('price', parseInt(priceMax));
    }

    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    if (search) {
      query = query.or(`spirit_name.ilike.%${search}%,spirit_brand.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        query = query.order('price', { ascending: true, nullsFirst: false });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'ending_soon':
        query = query.order('auction_end', { ascending: true, nullsFirst: false });
        break;
      case 'most_viewed':
        query = query.order('views', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Marketplace query error:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: listings || [],
      pagination: {
        limit,
        offset,
        total: count || listings?.length || 0,
      },
    });

  } catch (error) {
    console.error('Marketplace error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/marketplace - Create new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      seller_id,
      spirit_id,
      spirit_name,
      spirit_brand,
      spirit_category,
      spirit_image,
      listing_type,
      price,
      starting_bid,
      reserve_price,
      auction_duration,
      trade_for,
      condition,
      fill_level,
      description,
      shipping_options,
      location,
    } = body;

    // Validate required fields
    if (!seller_id || !spirit_name || !listing_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate listing type specific fields
    if (listing_type === 'sale' && !price) {
      return NextResponse.json({ error: 'Price required for sale listings' }, { status: 400 });
    }

    if (listing_type === 'auction' && !starting_bid) {
      return NextResponse.json({ error: 'Starting bid required for auctions' }, { status: 400 });
    }

    // Calculate auction end date
    let auctionEnd = null;
    if (listing_type === 'auction') {
      const days = auction_duration || 7;
      auctionEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('bv_marketplace_listings')
      .insert({
        seller_id,
        spirit_id,
        spirit_name,
        spirit_brand,
        spirit_category,
        spirit_image,
        listing_type,
        price: listing_type === 'sale' ? price : null,
        starting_bid: listing_type === 'auction' ? starting_bid : null,
        current_bid: listing_type === 'auction' ? starting_bid : null,
        reserve_price: listing_type === 'auction' ? reserve_price : null,
        auction_end: auctionEnd,
        trade_for: listing_type === 'trade' ? trade_for : null,
        condition: condition || 'sealed',
        fill_level: fill_level || 100,
        description,
        shipping_options: shipping_options || [],
        location,
        status: 'active',
        views: 0,
        saves: 0,
        bid_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create listing error:', error);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    // Log activity
    await supabase.from('bv_activity_log').insert({
      user_id: seller_id,
      event_type: 'listing_created',
      event_data: {
        listing_id: listing.id,
        listing_type,
        spirit_name,
      },
    });

    return NextResponse.json({
      success: true,
      data: listing,
    });

  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/marketplace - Update listing or place bid
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, listing_id, user_id, ...data } = body;

    if (!listing_id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    // Get current listing
    const { data: listing, error: fetchError } = await supabase
      .from('bv_marketplace_listings')
      .select('*')
      .eq('id', listing_id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    switch (action) {
      case 'view':
        // Increment view count
        await supabase
          .from('bv_marketplace_listings')
          .update({ views: listing.views + 1 })
          .eq('id', listing_id);
        return NextResponse.json({ success: true });

      case 'save':
        // Toggle save
        if (user_id) {
          const { data: existing } = await supabase
            .from('bv_saved_listings')
            .select('id')
            .eq('user_id', user_id)
            .eq('listing_id', listing_id)
            .single();

          if (existing) {
            await supabase.from('bv_saved_listings').delete().eq('id', existing.id);
            await supabase
              .from('bv_marketplace_listings')
              .update({ saves: Math.max(0, listing.saves - 1) })
              .eq('id', listing_id);
          } else {
            await supabase.from('bv_saved_listings').insert({ user_id, listing_id });
            await supabase
              .from('bv_marketplace_listings')
              .update({ saves: listing.saves + 1 })
              .eq('id', listing_id);
          }
        }
        return NextResponse.json({ success: true });

      case 'bid':
        // Place bid on auction
        if (listing.listing_type !== 'auction') {
          return NextResponse.json({ error: 'Not an auction listing' }, { status: 400 });
        }

        const bidAmount = data.bid_amount;
        if (!bidAmount || bidAmount <= (listing.current_bid || listing.starting_bid)) {
          return NextResponse.json({ error: 'Bid must be higher than current bid' }, { status: 400 });
        }

        // Check auction hasn't ended
        if (listing.auction_end && new Date(listing.auction_end) < new Date()) {
          return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
        }

        // Record bid
        await supabase.from('bv_auction_bids').insert({
          listing_id,
          bidder_id: user_id,
          bid_amount: bidAmount,
        });

        // Update listing
        await supabase
          .from('bv_marketplace_listings')
          .update({
            current_bid: bidAmount,
            bid_count: listing.bid_count + 1,
            highest_bidder_id: user_id,
          })
          .eq('id', listing_id);

        // Notify previous high bidder
        if (listing.highest_bidder_id && listing.highest_bidder_id !== user_id) {
          await supabase.from('bv_notifications').insert({
            user_id: listing.highest_bidder_id,
            type: 'outbid',
            title: 'You\'ve been outbid!',
            message: `Someone placed a higher bid on ${listing.spirit_name}`,
            data: { listing_id },
          });
        }

        return NextResponse.json({
          success: true,
          new_bid: bidAmount,
          bid_count: listing.bid_count + 1,
        });

      case 'update':
        // Update listing details (seller only)
        if (listing.seller_id !== user_id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { data: updated, error: updateError } = await supabase
          .from('bv_marketplace_listings')
          .update({
            price: data.price,
            description: data.description,
            shipping_options: data.shipping_options,
            updated_at: new Date().toISOString(),
          })
          .eq('id', listing_id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: updated });

      case 'close':
        // Close listing
        if (listing.seller_id !== user_id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await supabase
          .from('bv_marketplace_listings')
          .update({ status: 'closed' })
          .eq('id', listing_id);

        return NextResponse.json({ success: true });

      case 'sold':
        // Mark as sold
        if (listing.seller_id !== user_id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const finalPrice = listing.price || listing.current_bid;
        const platformFee = Math.round(finalPrice * PLATFORM_FEE * 100) / 100;
        const sellerPayout = finalPrice - platformFee;

        await supabase
          .from('bv_marketplace_listings')
          .update({
            status: 'sold',
            final_price: finalPrice,
            platform_fee: platformFee,
            seller_payout: sellerPayout,
            buyer_id: data.buyer_id || listing.highest_bidder_id,
            sold_at: new Date().toISOString(),
          })
          .eq('id', listing_id);

        // Update seller stats
        await supabase.rpc('increment_seller_trades', { p_user_id: listing.seller_id });

        return NextResponse.json({
          success: true,
          final_price: finalPrice,
          platform_fee: platformFee,
          seller_payout: sellerPayout,
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/marketplace - Delete listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!listingId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify ownership
    const { data: listing } = await supabase
      .from('bv_marketplace_listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();

    if (!listing || listing.seller_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete listing
    const { error } = await supabase
      .from('bv_marketplace_listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
