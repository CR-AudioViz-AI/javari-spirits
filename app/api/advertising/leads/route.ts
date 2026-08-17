import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      company,
      name,
      email,
      phone,
      website,
      budget,
      interest,
      message
    } = body;

    // Validate required fields
    if (!company || !name || !email) {
      return NextResponse.json(
        { error: 'Company, name, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Insert lead into database
    const { data, error } = await supabase
      .from('bv_advertising_leads')
      .insert({
        company_name: company,
        contact_name: name,
        email: email,
        phone: phone || null,
        website: website || null,
        budget_range: budget || null,
        interest_type: interest || null,
        message: message || null,
        source_page: '/advertise',
        ip_address: ip,
        user_agent: userAgent,
        status: 'new'
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // TODO: Send notification email to advertising team
    // await sendNotificationEmail({
    //   to: 'advertising@javarispirits.com',
    //   subject: `New Advertising Lead: ${company}`,
    //   body: `New lead from ${name} at ${company}...`
    // });

    // TODO: Send confirmation email to lead
    // await sendConfirmationEmail({
    //   to: email,
    //   name: name,
    //   company: company
    // });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! We will be in touch within 24-48 hours.',
      leadId: data?.id
    });

  } catch (error) {
    console.error('Advertising lead submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leads (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('bv_advertising_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      leads: data,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
