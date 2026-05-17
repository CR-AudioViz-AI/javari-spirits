// components/javari-widget/JavariWidget.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Universal Javari AI Chat Widget
// Drop into ANY app. Self-contained. Uses free AI models.
// Shows chat bubble → opens panel → full Javari AI conversation
// Includes: cross-sell to other Javari apps, credits display, upgrade prompt
// Created: May 16, 2026
// ─────────────────────────────────────────────────────────────────────────────
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface JavariWidgetProps {
  appName?:    string   // e.g. "Javari Spirits"
  appContext?: string   // e.g. "whiskey and spirits collecting"
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
}

const JAVARI_AI_URL = process.env.NEXT_PUBLIC_JAVARI_AI_URL ?? 'https://javariai.com'
const PLATFORM_URL  = process.env.NEXT_PUBLIC_CENTRAL_API_URL ?? 'https://craudiovizai.com'

// Cross-sell apps — shown contextually
const RELATED_APPS = [
  { name: 'Javari Resume',   url: 'https://javari-resume-builder.vercel.app', emoji: '📄', desc: 'Build your resume' },
  { name: 'Javari Legal',    url: 'https://javari-legal.vercel.app',           emoji: '⚖️',  desc: 'Legal documents' },
  { name: 'Javari Travel',   url: 'https://javaritravel.com',                  emoji: '✈️',  desc: 'Plan your trip' },
  { name: 'Javari Property', url: 'https://javariproperty.com',                emoji: '🏠',  desc: 'Real estate tools' },
]

export default function JavariWidget({
  appName    = 'Javari',
  appContext  = 'this platform',
  primaryColor = '#6366f1',
  position   = 'bottom-right',
}: JavariWidgetProps) {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [credits,  setCredits]  = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm Javari, your AI assistant for ${appName}. I'm here to help you get the most out of ${appContext}.\n\nWhat can I help you with today?`,
        timestamp: new Date(),
      }])
    }
  }, [open])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMsg, timestamp: new Date() }
    ]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch(`${JAVARI_AI_URL}/api/javari/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          stream: false,
        }),
      })

      if (res.ok) {
        const data = await res.json() as {
          choices?: Array<{ message?: { content?: string } }>
        }
        const reply = data.choices?.[0]?.message?.content ?? 'I had trouble responding. Please try again.'
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having a moment of downtime. Try again in a few seconds!',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, messages, loading])

  const posStyle: React.CSSProperties = position === 'bottom-right'
    ? { bottom: 20, right: 20 }
    : { bottom: 20, left: 20 }

  return (
    <>
      {/* Chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position:     'fixed',
            ...posStyle,
            width:        56,
            height:       56,
            borderRadius: '50%',
            background:   `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
            border:       'none',
            cursor:       'pointer',
            boxShadow:    '0 4px 20px rgba(0,0,0,0.3)',
            zIndex:       9998,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     24,
            transition:   'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          title="Chat with Javari AI"
        >
          🤖
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position:     'fixed',
          ...posStyle,
          width:        360,
          height:       520,
          background:   '#0f0f1a',
          border:       `1px solid ${primaryColor}40`,
          borderRadius: 16,
          boxShadow:    '0 20px 60px rgba(0,0,0,0.5)',
          zIndex:       9999,
          display:      'flex',
          flexDirection: 'column',
          overflow:     'hidden',
          fontFamily:   'Inter, system-ui, sans-serif',
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
            padding:    '12px 16px',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Javari AI</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Powered by 300+ AI models • Free</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18, opacity: 0.8 }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth:  '85%',
              }}>
                <div style={{
                  background: msg.role === 'user'
                    ? `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`
                    : '#1e1e2e',
                  color:      'white',
                  padding:    '8px 12px',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize:   13,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#1e1e2e', padding: '8px 12px', borderRadius: '12px 12px 12px 2px', color: '#666' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Cross-sell strip */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid #1e1e2e', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {RELATED_APPS.slice(0, 3).map(app => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background:   '#1e1e2e',
                  border:       '1px solid #2a2a3e',
                  borderRadius: 8,
                  padding:      '4px 8px',
                  textDecoration: 'none',
                  color:        '#9ca3af',
                  fontSize:     10,
                  whiteSpace:   'nowrap',
                  flexShrink:   0,
                }}
              >
                {app.emoji} {app.name}
              </a>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #1e1e2e', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask Javari anything…"
              style={{
                flex:         1,
                background:   '#1e1e2e',
                border:       `1px solid ${primaryColor}40`,
                borderRadius: 8,
                padding:      '8px 12px',
                color:        'white',
                fontSize:     13,
                outline:      'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() ? `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` : '#1e1e2e',
                border:     'none',
                borderRadius: 8,
                padding:    '8px 12px',
                color:      'white',
                cursor:     input.trim() ? 'pointer' : 'default',
                fontSize:   14,
                fontWeight: 700,
              }}
            >→</button>
          </div>

          {/* Footer */}
          <div style={{ padding: '4px 16px 8px', textAlign: 'center', fontSize: 10, color: '#374151' }}>
            <a href={PLATFORM_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'none' }}>
              Powered by Javari AI • CR AudioViz AI
            </a>
            {' • '}
            <a href={`${PLATFORM_URL}/pricing`} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'none' }}>
              Upgrade →
            </a>
          </div>
        </div>
      )}
    </>
  )
}
