/**
 * CRAV Barrels - Speakeasy Finder API
 * 
 * GET /api/speakeasies - List/search speakeasies
 * GET /api/speakeasies/[id] - Get speakeasy details
 * GET /api/speakeasies/nearby - Find speakeasies near location
 * POST /api/speakeasies - Submit new speakeasy (user contributed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const YELP_API_KEY = process.env.YELP_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Curated speakeasy data (fallback when database is empty)
const CURATED_SPEAKEASIES = [
  {
    id: 'pdq-nyc',
    name: 'Please Don\'t Tell (PDT)',
    city: 'New York',
    state: 'NY',
    address: '113 St Marks Pl',
    hidden_entrance: 'Enter through the phone booth inside Crif Dogs hot dog shop',
    password_required: false,
    reservation_required: true,
    reservation_url: 'https://www.pdtnyc.com/',
    vibe: ['intimate', 'craft cocktails', 'speakeasy'],
    signature_cocktails: [
      { name: 'Benton\'s Old Fashioned', description: 'Bacon-infused bourbon, maple syrup, bitters' }
    ],
    spirits_focus: ['whiskey', 'bourbon'],
    average_rating: 4.5,
    verified: true,
    original_speakeasy: false,
    year_opened: 2007
  },
  {
    id: 'death-co-nyc',
    name: 'Death & Co',
    city: 'New York',
    state: 'NY',
    address: '433 E 6th St',
    hidden_entrance: 'Look for the unmarked door with dim lighting',
    password_required: false,
    reservation_required: true,
    vibe: ['dark', 'sophisticated', 'craft cocktails'],
    spirits_focus: ['whiskey', 'mezcal', 'gin'],
    average_rating: 4.7,
    verified: true,
    original_speakeasy: false,
    year_opened: 2006
  },
  {
    id: 'violet-hour-chi',
    name: 'The Violet Hour',
    city: 'Chicago',
    state: 'IL',
    address: '1520 N Damen Ave',
    hidden_entrance: 'Find the unmarked door in Wicker Park - look for the light bulb',
    password_required: false,
    dress_code: 'No hats or athletic wear',
    vibe: ['elegant', 'prohibition-era', 'romantic'],
    spirits_focus: ['gin', 'whiskey'],
    average_rating: 4.6,
    verified: true,
    original_speakeasy: false,
    year_opened: 2007
  },
  {
    id: 'green-mill-chi',
    name: 'The Green Mill',
    city: 'Chicago',
    state: 'IL',
    address: '4802 N Broadway',
    hidden_entrance: 'No hidden entrance - but the tunnels Al Capone used are still beneath',
    historical_significance: 'Al Capone\'s favorite hangout. Original prohibition-era speakeasy.',
    vibe: ['historic', 'jazz', 'dive'],
    spirits_focus: ['whiskey', 'beer'],
    average_rating: 4.5,
    verified: true,
    original_speakeasy: true,
    year_opened: 1907
  },
  {
    id: 'bathtub-gin-nyc',
    name: 'Bathtub Gin',
    city: 'New York',
    state: 'NY',
    address: '132 9th Ave',
    hidden_entrance: 'Enter through Stone Street Coffee Company',
    password_required: false,
    vibe: ['prohibition-era', 'intimate', 'romantic'],
    signature_cocktails: [
      { name: 'Bathtub Gin & Tonic', description: 'House-made gin with elderflower tonic' }
    ],
    spirits_focus: ['gin'],
    average_rating: 4.3,
    verified: true,
    original_speakeasy: false,
    year_opened: 2012
  },
  {
    id: 'employees-only-nyc',
    name: 'Employees Only',
    city: 'New York',
    state: 'NY',
    address: '510 Hudson St',
    hidden_entrance: 'Look for the psychic\'s neon sign, enter through the curtain',
    vibe: ['speakeasy', 'late-night', 'industry'],
    spirits_focus: ['whiskey', 'gin', 'vodka'],
    average_rating: 4.4,
    verified: true,
    original_speakeasy: false,
    year_opened: 2004
  },
  {
    id: 'back-room-nyc',
    name: 'The Back Room',
    city: 'New York',
    state: 'NY',
    address: '102 Norfolk St',
    hidden_entrance: 'Down the alley, through the metal gate, up the stairs',
    historical_significance: 'Actual prohibition-era speakeasy where Lucky Luciano and Meyer Lansky drank',
    vibe: ['historic', 'intimate', 'prohibition-era'],
    signature_cocktails: [
      { name: 'Drinks in teacups', description: 'All cocktails served in teacups like during Prohibition' }
    ],
    average_rating: 4.2,
    verified: true,
    original_speakeasy: true,
    year_opened: 1920
  },
  {
    id: 'bourbon-branch-sf',
    name: 'Bourbon & Branch',
    city: 'San Francisco',
    state: 'CA',
    address: '501 Jones St',
    hidden_entrance: 'Knock on the door and give the password',
    password_required: true,
    password_hint: 'Make a reservation - password is sent via email',
    reservation_required: true,
    vibe: ['speakeasy', 'intimate', 'prohibition-era'],
    spirits_focus: ['whiskey', 'bourbon'],
    average_rating: 4.5,
    verified: true,
    original_speakeasy: false,
    year_opened: 2006
  },
  {
    id: 'williams-parlour-sf',
    name: 'Wilson & Wilson Detective Agency',
    city: 'San Francisco',
    state: 'CA',
    address: '501 Jones St (inside Bourbon & Branch)',
    hidden_entrance: 'Secret room within Bourbon & Branch - must solve puzzles to find it',
    password_required: true,
    vibe: ['mysterious', 'interactive', 'exclusive'],
    average_rating: 4.7,
    verified: true,
    original_speakeasy: false
  },
  {
    id: 'ravens-club-aa',
    name: 'The Raven\'s Club',
    city: 'Ann Arbor',
    state: 'MI',
    address: '207 S Main St',
    hidden_entrance: 'Unmarked door next to the main restaurant',
    vibe: ['sophisticated', 'craft cocktails', 'intimate'],
    spirits_focus: ['whiskey', 'gin', 'rum'],
    average_rating: 4.4,
    verified: true,
    original_speakeasy: false,
    year_opened: 2012
  }
];

/**
 * Search Yelp for speakeasies
 */
async function searchYelpSpeakeasies(city: string, state: string): Promise<any[]> {
  if (!YELP_API_KEY) {
    console.warn('Yelp API key not configured');
    return [];
  }

  const searchTerms = ['speakeasy', 'hidden bar', 'secret bar', 'craft cocktails'];
  const results: any[] = [];

  for (const term of searchTerms) {
    try {
      const response = await fetch(
        `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(term)}&location=${encodeURIComponent(`${city}, ${state}`)}&limit=10&categories=bars,cocktailbars`,
        {
          headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        results.push(...(data.businesses || []));
      }
    } catch (error) {
      console.error(`Yelp search failed for ${term}:`, error);
    }
  }

  // Deduplicate by Yelp ID
  const unique = [...new Map(results.map(r => [r.id, r])).values()];
  
  return unique.map(biz => ({
    id: `yelp-${biz.id}`,
    name: biz.name,
    city: biz.location?.city || city,
    state: biz.location?.state || state,
    address: biz.location?.address1,
    coordinates: {
      lat: biz.coordinates?.latitude,
      lng: biz.coordinates?.longitude
    },
    phone: biz.phone,
    website_url: biz.url,
    average_rating: biz.rating,
    review_count: biz.review_count,
    price_range: biz.price,
    photos: biz.photos || [],
    yelp_id: biz.id,
    verified: false,
    source: 'yelp'
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const id = searchParams.get('id');

  try {
    switch (action) {
      case 'list': {
        // First try database
        let query = supabase
          .from('speakeasies')
          .select('*')
          .eq('permanently_closed', false);

        if (city) {
          query = query.ilike('city', `%${city}%`);
        }
        if (state) {
          query = query.eq('state', state.toUpperCase());
        }

        const { data: dbResults, error } = await query.limit(50);

        if (error) {
          console.error('Database query failed:', error);
        }

        // If we have database results, return them
        if (dbResults && dbResults.length > 0) {
          return NextResponse.json({
            speakeasies: dbResults,
            source: 'database'
          });
        }

        // Otherwise, filter curated list
        let results = CURATED_SPEAKEASIES;
        
        if (city) {
          results = results.filter(s => 
            s.city.toLowerCase().includes(city.toLowerCase())
          );
        }
        if (state) {
          results = results.filter(s => 
            s.state.toUpperCase() === state.toUpperCase()
          );
        }

        // If searching a specific city and no curated results, try Yelp
        if (city && state && results.length === 0) {
          const yelpResults = await searchYelpSpeakeasies(city, state);
          return NextResponse.json({
            speakeasies: yelpResults,
            source: 'yelp'
          });
        }

        return NextResponse.json({
          speakeasies: results,
          source: 'curated'
        });
      }

      case 'get': {
        if (!id) {
          return NextResponse.json(
            { error: 'ID parameter required' },
            { status: 400 }
          );
        }

        // Try database first
        const { data, error } = await supabase
          .from('speakeasies')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          return NextResponse.json({ speakeasy: data });
        }

        // Try curated list
        const curated = CURATED_SPEAKEASIES.find(s => s.id === id);
        if (curated) {
          return NextResponse.json({ speakeasy: curated });
        }

        return NextResponse.json(
          { error: 'Speakeasy not found' },
          { status: 404 }
        );
      }

      case 'nearby': {
        if (!lat || !lng) {
          return NextResponse.json(
            { error: 'Latitude and longitude required' },
            { status: 400 }
          );
        }

        // This would use PostGIS for actual distance queries
        // For now, return curated list
        return NextResponse.json({
          speakeasies: CURATED_SPEAKEASIES.slice(0, 10),
          source: 'curated',
          note: 'Distance filtering not yet implemented'
        });
      }

      case 'cities': {
        const cities = [...new Set(CURATED_SPEAKEASIES.map(s => `${s.city}, ${s.state}`))];
        return NextResponse.json({ cities });
      }

      case 'featured': {
        // Return a few highlighted speakeasies
        const featured = CURATED_SPEAKEASIES.filter(
          s => s.original_speakeasy || s.average_rating >= 4.5
        ).slice(0, 5);
        
        return NextResponse.json({ featured });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Speakeasy API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch speakeasies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['name', 'city', 'state'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('speakeasies')
      .insert({
        name: body.name,
        city: body.city,
        state: body.state.toUpperCase(),
        address: body.address,
        hidden_entrance: body.hidden_entrance,
        password_required: body.password_required || false,
        password_hint: body.password_hint,
        dress_code: body.dress_code,
        reservation_required: body.reservation_required || false,
        reservation_url: body.reservation_url,
        vibe: body.vibe || [],
        spirits_focus: body.spirits_focus || [],
        website_url: body.website_url,
        phone: body.phone,
        verified: false,  // User submissions start unverified
        added_by: body.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save speakeasy:', error);
      return NextResponse.json(
        { error: 'Failed to save speakeasy' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Speakeasy submitted for review',
      speakeasy: data
    });

  } catch (error: any) {
    console.error('Speakeasy submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit speakeasy' },
      { status: 500 }
    );
  }
}
