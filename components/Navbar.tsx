'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://craudiovizai.com'

interface PlatformUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  credits_balance: number
  plan: string
}

const APPS = [
  { id: 'home', name: 'CR AudioViz AI', icon: '🎨', url: PLATFORM_URL },
  { id: 'javari', name: 'Javari AI', icon: '🤖', url: 'https://javariai.com' },
  { id: 'cardverse', name: 'CardVerse', icon: '🃏', url: 'https://cardverse.craudiovizai.com' },
  { id: 'games', name: 'Games', icon: '🎮', url: 'https://games.craudiovizai.com' },
]

export function Navbar() {
  const [user, setUser] = useState<PlatformUser | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [showApps, setShowApps] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token')
      
      if (urlToken) {
        localStorage.setItem('javari_platform_token', urlToken)
        window.history.replaceState({}, '', window.location.pathname)
      }

      const token = localStorage.getItem('javari_platform_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${PLATFORM_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setCredits(data.user.credits_balance)
      } else {
        localStorage.removeItem('javari_platform_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleLogin() {
    const returnUrl = encodeURIComponent(window.location.href)
    window.location.href = `${PLATFORM_URL}/auth/login?app=barrelverse&return=${returnUrl}`
  }

  function handleLogout() {
    localStorage.removeItem('javari_platform_token')
    setUser(null)
    window.location.href = PLATFORM_URL
  }

  function purchaseCredits() {
    const returnUrl = encodeURIComponent(window.location.href)
    window.location.href = `${PLATFORM_URL}/credits/purchase?app=barrelverse&return=${returnUrl}`
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-sm border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setShowApps(!showApps)} className="p-2 hover:bg-stone-800 rounded-lg">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            {showApps && (
              <>
                <div className="fixed inset-0" onClick={() => setShowApps(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-2 text-xs text-stone-500 uppercase">CR AudioViz AI Apps</div>
                  {APPS.map(app => (
                    <a key={app.id} href={app.url} className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-800">
                      <span className="text-xl">{app.icon}</span>
                      <span className="text-white">{app.name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🥃</span>
            <span className="text-xl font-bold text-amber-500">Javari Spirits</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-stone-300 hover:text-amber-400">Home</Link>
          <Link href="/spirits" className="text-stone-300 hover:text-amber-400">Spirits</Link>
          <Link href="/collection" className="text-stone-300 hover:text-amber-400">Collection</Link>
          <Link href="/games" className="text-stone-300 hover:text-amber-400">Games</Link>
          <Link href="/academy" className="text-stone-300 hover:text-amber-400">Academy</Link>
          <Link href="/distilleries" className="text-stone-300 hover:text-amber-400">Distilleries</Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <button onClick={purchaseCredits} className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/20 text-amber-400 rounded-full text-sm font-medium hover:bg-amber-600/30">
              <span>💎</span>
              <span>{credits.toLocaleString()}</span>
            </button>
          )}

          {loading ? (
            <div className="w-9 h-9 bg-stone-800 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button onClick={() => setShowProfile(!showProfile)} className="p-1 hover:bg-stone-800 rounded-lg">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                )}
              </button>
              {showProfile && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowProfile(false)} />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-stone-700">
                      <div className="font-medium text-white">{user.name || 'User'}</div>
                      <div className="text-sm text-stone-400">{user.email}</div>
                      <div className="mt-1 inline-block px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs rounded-full uppercase">{user.plan}</div>
                    </div>
                    <Link href="/collection" className="block px-4 py-2.5 text-stone-300 hover:bg-stone-800">My Collection</Link>
                    <a href={`${PLATFORM_URL}/account`} className="block px-4 py-2.5 text-stone-300 hover:bg-stone-800">Account Settings</a>
                    <a href={`${PLATFORM_URL}/credits`} className="block px-4 py-2.5 text-stone-300 hover:bg-stone-800">Manage Credits</a>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-stone-800">Sign Out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={handleLogin} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg">Sign In</button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
