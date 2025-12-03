import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin route for database operations - protected by CRON_SECRET
export async function POST(request: NextRequest) {
  // Verify secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create admin client that bypasses RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const body = await request.json();
    const { action, table, data, query } = body;

    switch (action) {
      case 'insert':
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from(table)
          .insert(data)
          .select();
        if (insertError) throw insertError;
        return NextResponse.json({ success: true, data: insertData });

      case 'upsert':
        const { data: upsertData, error: upsertError } = await supabaseAdmin
          .from(table)
          .upsert(data)
          .select();
        if (upsertError) throw upsertError;
        return NextResponse.json({ success: true, data: upsertData });

      case 'count':
        const { count, error: countError } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        return NextResponse.json({ success: true, count });

      case 'select':
        const { data: selectData, error: selectError } = await supabaseAdmin
          .from(table)
          .select(query || '*')
          .limit(100);
        if (selectError) throw selectError;
        return NextResponse.json({ success: true, data: selectData });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
