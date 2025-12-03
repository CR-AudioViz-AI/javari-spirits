import { NextResponse } from 'next/server'
import { runMassiveExpansion } from '@/lib/automation/massive-engine'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const results = await runMassiveExpansion()
    return NextResponse.json({ 
      success: true, 
      message: 'Massive expansion completed',
      results 
    })
  } catch (error) {
    console.error('Expansion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Manual trigger via POST
export async function POST(request: Request) {
  return GET(request)
}
