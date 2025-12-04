'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [invitesSent, setInvitesSent] = useState(0)
  
  // Mock user data
  const userData = {
    referralCode: 'WHISKEY2024',
    referralLink: 'https://barrelverse.com/join/WHISKEY2024',
    referralsCount: 7,
    pendingRewards: 350, // credits
    totalEarned: 1200,
    tier: 'Gold Ambassador',
    nextTier: 'Platinum Ambassador',
    referralsToNextTier: 3
  }

  const referralTiers = [
    { name: 'Bronze', min: 1, bonus: 50, perks: ['50 credits per referral', 'Bronze badge'] },
    { name: 'Silver', min: 5, bonus: 75, perks: ['75 credits per referral', 'Silver badge', '1 month free Enthusiast'] },
    { name: 'Gold', min: 10, bonus: 100, perks: ['100 credits per referral', 'Gold badge', '3 months free Enthusiast', 'Early access features'] },
    { name: 'Platinum', min: 25, bonus: 150, perks: ['150 credits per referral', 'Platinum badge', '1 year free Collector Pro', 'VIP support', 'Annual swag box'] },
    { name: 'Diamond', min: 50, bonus: 200, perks: ['200 credits per referral', 'Diamond badge', 'Lifetime Collector Pro', 'Feature naming rights', 'Distillery tour (annual)'] }
  ]

  const shareOptions = [
    { name: 'Facebook', icon: '📘', color: 'bg-blue-600', url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(userData.referralLink)}` },
    { name: 'Twitter/X', icon: '🐦', color: 'bg-black', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Join me on BarrelVerse - the ultimate spirits collector platform!')}&url=${encodeURIComponent(userData.referralLink)}` },
    { name: 'WhatsApp', icon: '💬', color: 'bg-green-600', url: `https://wa.me/?text=${encodeURIComponent('Check out BarrelVerse - track your bourbon collection, learn spirits history, and more! ' + userData.referralLink)}` },
    { name: 'Reddit', icon: '🔴', color: 'bg-orange-600', url: `https://reddit.com/submit?url=${encodeURIComponent(userData.referralLink)}&title=${encodeURIComponent('Found an amazing bourbon/spirits tracking app')}` },
    { name: 'Email', icon: '📧', color: 'bg-gray-600', url: `mailto:?subject=${encodeURIComponent('You need to check out BarrelVerse')}&body=${encodeURIComponent('Hey! I found this awesome spirits collector platform. ' + userData.referralLink)}` }
  ]

  const copyLink = () => {
    navigator.clipboard.writeText(userData.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendInvite = () => {
    if (email) {
      setInvitesSent(prev => prev + 1)
      setEmail('')
      alert(`Invitation sent to ${email}!`)
    }
  }

  // Social proof - fake but realistic
  const recentReferrals = [
    { name: 'John D.', reward: 100, time: '2 hours ago' },
    { name: 'Sarah M.', reward: 100, time: '5 hours ago' },
    { name: 'Mike R.', reward: 100, time: '1 day ago' }
  ]

  const leaderboard = [
    { rank: 1, name: 'BourbonHunter', referrals: 127, tier: 'Diamond' },
    { rank: 2, name: 'WhiskeyWanderer', referrals: 89, tier: 'Diamond' },
    { rank: 3, name: 'BarrelMaster', referrals: 67, tier: 'Platinum' },
    { rank: 4, name: 'OakAged', referrals: 45, tier: 'Platinum' },
    { rank: 5, name: 'ProofPositive', referrals: 38, tier: 'Gold' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/profile" className="hover:text-amber-400 transition-colors">Profile</Link>
            <Link href="/pricing" className="hover:text-amber-400 transition-colors">Upgrade</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
            🎁 REFERRAL PROGRAM
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Share the Love, <span className="text-amber-400">Earn Rewards</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Invite fellow spirits enthusiasts to BarrelVerse. You both win - 
            they get a premium experience, you earn credits and exclusive perks.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-br from-amber-900/50 to-stone-800/50 rounded-xl p-6 text-center border border-amber-500/30">
            <div className="text-4xl font-bold text-amber-400">{userData.referralsCount}</div>
            <div className="text-gray-400">Successful Referrals</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-stone-800/50 rounded-xl p-6 text-center border border-green-500/30">
            <div className="text-4xl font-bold text-green-400">{userData.pendingRewards}</div>
            <div className="text-gray-400">Pending Credits</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-stone-800/50 rounded-xl p-6 text-center border border-purple-500/30">
            <div className="text-4xl font-bold text-purple-400">{userData.totalEarned}</div>
            <div className="text-gray-400">Total Earned</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-stone-800/50 rounded-xl p-6 text-center border border-yellow-500/30">
            <div className="text-4xl font-bold text-yellow-400">🏆</div>
            <div className="text-gray-400">{userData.tier}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Sharing Tools */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Referral Link */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔗</span> Your Referral Link
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={userData.referralLink}
                  readOnly
                  className="flex-1 bg-stone-700 rounded-lg px-4 py-3 text-gray-300"
                />
                <button
                  onClick={copyLink}
                  className={`px-6 rounded-lg font-semibold transition-colors ${
                    copied ? 'bg-green-600' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Your code: <span className="text-amber-400 font-mono">{userData.referralCode}</span>
              </p>
            </div>

            {/* Share Buttons */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📤</span> Share on Social
              </h2>
              <div className="grid grid-cols-5 gap-3">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${option.color} hover:opacity-80 rounded-xl p-4 text-center transition-all hover:scale-105`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs">{option.name}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Email Invites */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📧</span> Invite by Email
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@email.com"
                  className="flex-1 bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={sendInvite}
                  className="bg-amber-600 hover:bg-amber-500 px-6 rounded-lg font-semibold transition-colors"
                >
                  Send Invite
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {invitesSent > 0 ? `${invitesSent} invite(s) sent this session` : 'We\'ll send a personalized invitation'}
              </p>
            </div>

            {/* Share Ideas */}
            <div className="bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-2xl p-6 border border-amber-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Share Ideas That Work
              </h2>
              <div className="space-y-3">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-300 italic">"Just discovered BarrelVerse - finally a proper way to track my bourbon collection! Use my link for bonus credits:"</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Great for: Bourbon Facebook groups, Reddit r/bourbon</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-300 italic">"If you're into whiskey/bourbon, check out this spirits museum - you can literally walk through history:"</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Great for: Twitter/X, Instagram stories</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-300 italic">"My wife found this app that tracks what bottles we have - no more duplicate buys! 😅"</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Great for: Personal messages, family group chats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Leaderboard */}
          <div className="space-y-6">
            {/* Tier Progress */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📈</span> Your Progress
              </h2>
              <div className="text-center mb-4">
                <div className="inline-block bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full p-6 mb-2">
                  <span className="text-4xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold">{userData.tier}</h3>
                <p className="text-gray-400 text-sm">
                  {userData.referralsToNextTier} more referrals to {userData.nextTier}
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-stone-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-3 rounded-full"
                  style={{ width: `${(userData.referralsCount / 10) * 100}%` }}
                />
              </div>

              {/* Tier benefits */}
              <div className="space-y-2">
                {referralTiers.slice(0, 4).map((tier, i) => (
                  <div
                    key={tier.name}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      userData.referralsCount >= tier.min
                        ? 'bg-amber-900/30 text-amber-400'
                        : 'bg-stone-700/30 text-gray-500'
                    }`}
                  >
                    <span>{userData.referralsCount >= tier.min ? '✓' : '○'} {tier.name}</span>
                    <span>{tier.min}+ referrals</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔔</span> Recent Rewards
              </h2>
              <div className="space-y-3">
                {recentReferrals.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between bg-stone-700/30 rounded-lg p-3">
                    <div>
                      <p className="font-semibold">{ref.name} joined!</p>
                      <p className="text-xs text-gray-500">{ref.time}</p>
                    </div>
                    <span className="text-green-400 font-bold">+{ref.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🏅</span> Top Ambassadors
              </h2>
              <div className="space-y-2">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.rank <= 3 ? 'bg-amber-900/30' : 'bg-stone-700/30'
                    }`}
                  >
                    <span className={`text-xl ${
                      user.rank === 1 ? 'text-yellow-400' :
                      user.rank === 2 ? 'text-gray-300' :
                      user.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.tier}</p>
                    </div>
                    <span className="text-amber-400 font-bold">{user.referrals}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Breakdown */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">🎁 Reward Tiers</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {referralTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 text-center border ${
                  userData.referralsCount >= tier.min
                    ? 'bg-gradient-to-br from-amber-900/50 to-stone-800/50 border-amber-500/50'
                    : 'bg-stone-800/30 border-stone-700/50'
                }`}
              >
                <div className={`text-3xl mb-2 ${
                  tier.name === 'Bronze' ? 'text-amber-700' :
                  tier.name === 'Silver' ? 'text-gray-300' :
                  tier.name === 'Gold' ? 'text-yellow-400' :
                  tier.name === 'Platinum' ? 'text-blue-300' : 'text-cyan-300'
                }`}>
                  {tier.name === 'Bronze' ? '🥉' :
                   tier.name === 'Silver' ? '🥈' :
                   tier.name === 'Gold' ? '🥇' :
                   tier.name === 'Platinum' ? '💎' : '👑'}
                </div>
                <h3 className="font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{tier.min}+ referrals</p>
                <div className="text-2xl font-bold text-amber-400 mb-3">+{tier.bonus}</div>
                <ul className="text-xs text-gray-500 space-y-1">
                  {tier.perks.map((perk, j) => (
                    <li key={j}>• {perk}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-stone-800/30 rounded-2xl p-8 border border-amber-900/30">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Share Your Link</h3>
              <p className="text-gray-400">Post your unique referral link in bourbon groups, social media, or send directly to friends</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Friends Sign Up</h3>
              <p className="text-gray-400">When someone joins using your link, they get 100 bonus credits and exclusive perks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">You Both Win</h3>
              <p className="text-gray-400">You earn credits, badges, and climb the ambassador ranks. More referrals = better rewards!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
