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
// app/api/ai/sommelier/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
import { ai } from '@/lib/platform';


const supabase = lazyAdminDb();

const SYSTEM_PROMPT = `You are an expert AI Sommelier for BarrelVerse, specializing in whiskey, bourbon, scotch, rum, tequila, gin, vodka, and all spirits. You have extensive knowledge of:

- Distilleries worldwide and their histories
- Tasting notes, flavor profiles, and production methods
- Food pairings for different spirits
- Cocktail recipes and mixology techniques
- Price points and value recommendations
- Rare and allocated bottles
- Collection building and investment advice

Your personality:
- Warm and approachable, like a knowledgeable bartender
- Passionate about helping people discover new spirits
- Honest about quality regardless of price
- Respectful of all experience levels from beginners to experts

Guidelines:
- Always recommend responsibly
- If asked about health effects, encourage moderation
- Be specific with recommendations (give actual bottle names)
- Explain WHY you're recommending something
- Consider the user's budget when mentioned
- Offer alternatives at different price points`;

export async function POST(request: NextRequest) {
  try {
    // user id deliberately not taken from the body.
    const {message, sessionId,  context} = await request.json();
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Check user's subscription for rate limiting
    if (userId) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .single();

      const plan = sub?.plan || 'free';
      
      // Count messages this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('bv_ai_conversations')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', startOfMonth.toISOString());

      const limits: Record<string, number> = {
        free: 5,
        collector: 10,
        connoisseur: 50,
        sommelier: Infinity,
      };

      if ((count || 0) >= limits[plan]) {
        return NextResponse.json({
          error: 'Monthly limit reached',
          upgrade: true,
          message: `You've reached your ${limits[plan]} AI chat limit for this month. Upgrade to continue chatting!`
        }, { status: 429 });
      }
    }

    // Get conversation history if sessionId provided
    let conversationHistory: any[] = [];
    if (sessionId) {
      const { data: history } = await supabase
        .from('bv_ai_conversations')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (history) {
        conversationHistory = history.map(h => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        }));
      }
    }

    // Add context about user's collection if available
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (context?.collection) {
      enhancedSystemPrompt += `\n\nThe user's collection includes: ${context.collection.join(', ')}. Use this to personalize recommendations.`;
    }
    if (context?.preferences) {
      enhancedSystemPrompt += `\n\nUser preferences: ${context.preferences}`;
    }

    // 2026-08-24: THIS CALLED ANTHROPIC DIRECTLY and was BROKEN IN PRODUCTION.
    // Verified live: POST with a valid body returned HTTP 500 carrying
    // {"error":"401 authentication_error: API key is invalid."} - so the flagship
    // AI feature of this app failed on every call, and the raw upstream error was
    // passed to the client, leaking the provider and the failure mode.
    //
    // Fixing the key alone would have made it WORK AND STILL BE WRONG. The COST
    // LAW is explicit: Javari uses free or low-cost models - Groq llama-3.3-70b,
    // then gemini-flash, then Groq gpt-oss-120b - and NOT Claude. This route
    // bypassed the cascade entirely, at Anthropic pricing per recommendation.
    //
    // lib/platform.ts `ai.generate(prompt, system)` already implements that
    // cascade in this repo and is what javari/chat uses. Using it rather than
    // adding a second implementation - this ecosystem has thirteen duplicate
    // modules from answering one need twice.
    //
    // Conversation history is folded into the prompt because ai.generate takes a
    // single prompt rather than a message array. Same information, one string.
    const historyText = conversationHistory
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');
    const fullPrompt = historyText
      ? `${historyText}\nuser: ${message}`
      : message;

    const assistantMessage = await ai.generate(fullPrompt, enhancedSystemPrompt);

    if (!assistantMessage || assistantMessage.trim().length === 0) {
      // Never return an empty recommendation dressed as success - that is the
      // fake-success shape this audit has removed eighty times.
      return NextResponse.json(
        { error: 'The sommelier is temporarily unavailable. Please try again.' },
        { status: 503 },
      );
    }

    // Save conversation
    const newSessionId = sessionId || crypto.randomUUID();
    
    if (userId) {
      await supabase.from('bv_ai_conversations').insert([
        {
          user_id: userId,
          session_id: newSessionId,
          role: 'user',
          content: message,
          tokens_used: null,
        },
        {
          user_id: userId,
          session_id: newSessionId,
          role: 'assistant',
          content: assistantMessage,
          tokens_used: null,
        },
      ]);
    }

    return NextResponse.json({
      message: assistantMessage,
      sessionId: newSessionId,
      // Omitted rather than reported as 0 - the cascade does not surface usage,
      // and a zero here would be a fabricated metric.
      tokensUsed: null,
    });
  } catch (error: any) {
    console.error('AI Sommelier error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
