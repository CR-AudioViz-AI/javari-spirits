/**
 * BARRELVERSE CONTENT GENERATION CRON
 * Runs every 6 hours to continuously add content
 * 
 * This endpoint is called by Vercel Cron to keep the platform fresh
 * with new spirits, history, trivia, cocktails, and courses.
 */

import { NextRequest, NextResponse } from 'next/server'
import { BarrelVerseContentEngine } from '@/lib/automation/content-engine'

// Configure cron schedule
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log('🚀 Starting BarrelVerse content generation...')

  try {
    const engine = new BarrelVerseContentEngine()
    
    // Run a balanced content cycle
    // Adjusted for 5-minute timeout
    const stats = await engine.runCycle({
      spirits: 50,      // 50 new spirits
      history: 10,      // 10 history articles
      trivia: 25,       // 25 trivia questions
      cocktails: 10,    // 10 cocktail recipes
      courses: 2        // 2 courses
    })

    const duration = Math.round((Date.now() - startTime) / 1000)

    return NextResponse.json({
      success: true,
      message: 'Content generation complete',
      duration: `${duration}s`,
      stats,
      nextRun: 'In 6 hours'
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${Math.round((Date.now() - startTime) / 1000)}s`
    }, { status: 500 })
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
