/**
 * JAVARI CHAT API
 * ===============
 * AI-powered chat assistant for BarrelVerse
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { lazyAdminDb } from '@/lib/supabase/admin';
// 2026-08-31: LAZY, not module scope. A OpenAI client constructed here runs
// during `next build` when Next collects page data, so the BUILD would need a
// live OPENAI_API_KEY — and the vault cannot serve a build. Constructing on first use
// means the key is read when a request arrives, after hydration has run.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const supabase = lazyAdminDb();

const SYSTEM_PROMPT = `You are Javari, the AI assistant for BarrelVerse - the ultimate spirits knowledge and collection platform.

Your personality:
- Friendly, knowledgeable, and passionate about spirits
- Use casual but professional language
- Include relevant emojis occasionally
- Be helpful and proactive

Your capabilities:
- Answer questions about spirits (bourbon, scotch, rum, tequila, whiskey, etc.)
- Help users navigate the platform
- Explain features and pricing
- Create support tickets when needed
- Suggest features and improvements
- Search the knowledge base

When users report problems:
1. Acknowledge their frustration
2. Ask clarifying questions if needed
3. Offer to create a support ticket
4. Provide workarounds if possible

When users ask about features:
- Explain available features based on their tier
- Suggest upgrades when relevant (but not pushy)
- Point them to the right section of the app

Context about BarrelVerse:
- Track bottle collections
- Play trivia games and earn $PROOF tokens
- Visit the 3D Spirits Museum
- Buy/sell in the Marketplace
- Earn achievements and certifications
- Premium tiers: Connoisseur ($9.99/mo), Master Distiller ($24.99/mo)`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, userId, history } = body;

    // Build conversation history
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add context
    if (context) {
      messages.push({
        role: 'system',
        content: `User is currently on the ${context} page.`
      });
    }

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Get AI response
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiMessage = response.choices[0].message.content || "I'm sorry, I couldn't process that. Please try again.";

    // Detect if we should create a ticket
    const shouldCreateTicket = message.toLowerCase().includes('bug') ||
      message.toLowerCase().includes('error') ||
      message.toLowerCase().includes('broken') ||
      message.toLowerCase().includes('not working');

    // Generate quick actions based on context
    const actions = [];
    
    if (shouldCreateTicket) {
      actions.push({
        label: 'Create Support Ticket',
        action: 'create_ticket',
        icon: '🎫'
      });
    }

    if (message.toLowerCase().includes('feature') || message.toLowerCase().includes('idea')) {
      actions.push({
        label: 'Submit Feature Request',
        action: 'suggest_feature',
        icon: '💡'
      });
    }

    // Log conversation for analytics
    if (userId) {
      await supabase
        .from('bv_activity_log')
        .insert({
          user_id: userId,
          event_type: 'javari_chat',
          event_data: {
            message: message.substring(0, 200),
            context
          }
        });
    }

    return NextResponse.json({
      message: aiMessage,
      actions
    });

  } catch (error) {
    console.error('Javari chat error:', error);
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Please try again in a moment, or use the Help Center for assistance.",
      actions: [
        { label: 'Go to Help Center', action: 'open_help', icon: '📚' }
      ]
    });
  }
}
