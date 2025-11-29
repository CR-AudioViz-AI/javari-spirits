'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

type Reward = {
  id: string
  name: string
  description: string
  category: string
  proof_cost: number
  image_url: string | null
  quantity_available: number | null
  is_limited: boolean
  is_active: boolean
}

const CATEGORY_INFO: Record<string, { icon: string; label: string; color: string }> = {
  merchandise: { icon: '🎁', label: 'Merchandise', color: 'bg-amber-600' },
  digital: { icon: '📱', label: 'Digital', color: 'bg-blue-600' },
  experience: { icon: '🎟️', label: 'Experience', color: 'bg-purple-600' },
  discount: { icon: '💰', label: 'Discount', color: 'bg-green-600' },
  exclusive: { icon: '⭐', label: 'Exclusive', color: 'bg-orange-600' },
}

export default function RewardsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [redeeming, setRedeeming] = useState<string | null>(null)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bv_rewards')
        .select('*')
        .eq('is_active', true)
        .order('proof_cost', { ascending: true })

      if (error) throw error
      setRewards(data || [])
    } catch (err) {
      console.error('Error fetching rewards:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (reward: Reward) => {
    if (!user || !profile) {
      alert('Please sign in to redeem rewards')
      return
    }

    if (profile.proof_balance < reward.proof_cost) {
      alert(`You need ${reward.proof_cost - profile.proof_balance} more $PROOF to redeem this reward`)
      return
    }

    setRedeeming(reward.id)
    
    try {
      const supabase = createClient()
      
      // Deduct balance and record redemption
      const { error: balanceError } = await supabase
        .from('bv_profiles')
        .update({ 
          proof_balance: profile.proof_balance - reward.proof_cost 
        })
        .eq('id', user.id)

      if (balanceError) throw balanceError

      // Record the redemption
      const { error: rewardError } = await supabase
        .from('bv_user_rewards')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          status: 'pending'
        })

      if (rewardError) throw rewardError

      // Record transaction
      const { error: txError } = await supabase
        .from('bv_proof_transactions')
        .insert({
          user_id: user.id,
          amount: -reward.proof_cost,
          transaction_type: 'spend',
          description: `Redeemed: ${reward.name}`,
          reference_id: reward.id,
          reference_type: 'reward',
          balance_after: profile.proof_balance - reward.proof_cost
        })

      if (txError) throw txError

      alert(`Successfully redeemed ${reward.name}! Check your email for details.`)
      window.location.reload()
    } catch (err) {
      console.error('Error redeeming reward:', err)
      alert('Failed to redeem reward. Please try again.')
    } finally {
      setRedeeming(null)
    }
  }

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory)

  const userBalance = profile?.proof_balance || 0

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🎁</div>
          <p className="text-xl">Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center text-amber-300 hover:text-amber-200">
            ← Back to Home
          </Link>
          {user && (
            <div className="bg-stone-800/50 border border-amber-600/30 rounded-lg px-4 py-2">
              <span className="text-stone-400 text-sm">Your Balance:</span>
              <span className="text-amber-400 font-bold ml-2">{userBalance.toLocaleString()} $PROOF</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🏆 $PROOF Rewards</h1>
          <p className="text-xl text-amber-200">Redeem your earned tokens for real rewards</p>
          {!user && (
            <Link href="/auth/login" className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded-lg">
              Sign in to redeem rewards
            </Link>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-amber-600 text-white' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            All Rewards
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === key 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {info.icon} {info.label}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const categoryInfo = CATEGORY_INFO[reward.category] || CATEGORY_INFO.digital
            const canAfford = userBalance >= reward.proof_cost
            
            return (
              <div 
                key={reward.id}
                className="bg-stone-800/50 border border-amber-600/30 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all"
              >
                {/* Reward Image/Icon */}
                <div className={`h-32 ${categoryInfo.color} flex items-center justify-center`}>
                  <span className="text-6xl">{categoryInfo.icon}</span>
                </div>
                
                {/* Reward Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{reward.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${categoryInfo.color}`}>
                      {categoryInfo.label}
                    </span>
                  </div>
                  
                  <p className="text-stone-400 text-sm mb-4">{reward.description}</p>
                  
                  {reward.is_limited && reward.quantity_available && (
                    <p className="text-orange-400 text-sm mb-4">
                      ⚠️ Limited: {reward.quantity_available} remaining
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-amber-400 font-bold">
                      {reward.proof_cost.toLocaleString()} $PROOF
                    </div>
                    
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!user || !canAfford || redeeming === reward.id}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        !user 
                          ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                          : canAfford
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-stone-700 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {redeeming === reward.id 
                        ? 'Redeeming...' 
                        : !user 
                          ? 'Sign in' 
                          : canAfford 
                            ? 'Redeem' 
                            : 'Need more $PROOF'
                      }
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-stone-400">No rewards available in this category</p>
          </div>
        )}

        {/* How to Earn Section */}
        <div className="mt-16 bg-stone-800/50 border border-amber-600/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How to Earn $PROOF</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-bold mb-2">Play Trivia</h3>
              <p className="text-stone-400 text-sm">Earn 10-25 $PROOF per correct answer</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-bold mb-2">Build Streaks</h3>
              <p className="text-stone-400 text-sm">Multipliers for consecutive correct answers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-bold mb-2">Complete Courses</h3>
              <p className="text-stone-400 text-sm">50-200 $PROOF per completed course</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/games"
              className="inline-block bg-amber-600 hover:bg-amber-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Earning Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
