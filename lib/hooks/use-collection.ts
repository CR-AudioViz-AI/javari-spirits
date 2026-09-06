// lib/hooks/use-collection.ts
// BarrelVerse Collection Management Hook

'use client'

import { useState, useCallback, useEffect } from 'react'
import { getClient } from '@/lib/supabase/client'
import type { 
  Spirit, 
  UserCollection, 
  CollectionItemWithSpirit, 
  SpiritCategory, 
  Rarity 
} from '@/lib/types/database'

interface CollectionState {
  items: CollectionItemWithSpirit[]
  spirits: Spirit[]
  isLoading: boolean
  error: Error | null
  stats: CollectionStats
}

interface CollectionStats {
  totalBottles: number
  totalValue: number
  uniqueSpirits: number
  categoryCounts: Record<SpiritCategory, number>
  rarityCounts: Record<Rarity, number>
  openedCount: number
  sealedCount: number
}

const initialStats: CollectionStats = {
  totalBottles: 0,
  totalValue: 0,
  uniqueSpirits: 0,
  categoryCounts: {} as Record<SpiritCategory, number>,
  rarityCounts: {} as Record<Rarity, number>,
  openedCount: 0,
  sealedCount: 0,
}

export function useCollection(userId?: string) {
  const [state, setState] = useState<CollectionState>({
    items: [],
    spirits: [],
    isLoading: false,
    error: null,
    stats: initialStats,
  })

  const supabase = getClient()

  // Calculate collection statistics
  const calculateStats = useCallback((items: CollectionItemWithSpirit[]): CollectionStats => {
    const stats: CollectionStats = {
      totalBottles: 0,
      totalValue: 0,
      uniqueSpirits: items.length,
      categoryCounts: {} as Record<SpiritCategory, number>,
      rarityCounts: {} as Record<Rarity, number>,
      openedCount: 0,
      sealedCount: 0,
    }

    items.forEach(item => {
      stats.totalBottles += item.quantity
      stats.totalValue += (item.purchase_price || item.spirit.msrp || 0) * item.quantity

      const category = item.spirit.category
      stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + item.quantity

      const rarity = item.spirit.rarity
      stats.rarityCounts[rarity] = (stats.rarityCounts[rarity] || 0) + item.quantity

      if (item.is_opened) {
        stats.openedCount += item.quantity
      } else {
        stats.sealedCount += item.quantity
      }
    })

    return stats
  }, [])

  // Fetch user's collection
  const fetchCollection = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, items: [], stats: initialStats }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('bv_user_collections')
        .select(`
          *,
          spirit:bv_spirits(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const items = (data || []) as CollectionItemWithSpirit[]
      const stats = calculateStats(items)

      setState(prev => ({
        ...prev,
        items,
        stats,
        isLoading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }))
    }
  }, [userId, supabase, calculateStats])

  // Fetch all available spirits
  const fetchSpirits = useCallback(async (
    category?: SpiritCategory,
    search?: string,
    limit: number = 50
  ) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      let query = supabase
        .from('bv_spirits')
        .select('*')
        .order('name')

      if (category) {
        query = query.eq('category', category)
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,distillery.ilike.%${search}%`)
      }

      const { data, error } = await query.limit(limit)

      if (error) throw error

      setState(prev => ({
        ...prev,
        spirits: data || [],
        isLoading: false,
      }))

      return data || []
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }))
      return []
    }
  }, [supabase])

  // Add item to collection
  const addToCollection = async (
    spiritId: string,
    details: {
      quantity?: number
      purchasePrice?: number
      purchaseDate?: string
      purchaseLocation?: string
      personalNotes?: string
    } = {}
  ) => {
    if (!userId) return { success: false, error: new Error('Must be logged in') }

    try {
      const { data, error } = await supabase
        .from('bv_user_collections')
        .insert({
          user_id: userId,
          spirit_id: spiritId,
          quantity: details.quantity || 1,
          purchase_price: details.purchasePrice,
          purchase_date: details.purchaseDate,
          purchase_location: details.purchaseLocation,
          personal_notes: details.personalNotes,
        })
        .select(`
          *,
          spirit:bv_spirits(*)
        `)
        .single()

      if (error) throw error

      const newItem = data as CollectionItemWithSpirit
      
      setState(prev => {
        const newItems = [newItem, ...prev.items]
        return {
          ...prev,
          items: newItems,
          stats: calculateStats(newItems),
        }
      })

      return { success: true, item: newItem }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  // Update collection item
  const updateCollectionItem = async (
    itemId: string,
    updates: Partial<{
      quantity: number
      purchasePrice: number
      currentFillLevel: number
      isOpened: boolean
      openedDate: string
      personalRating: number
      personalNotes: string
      storageLocation: string
      forTrade: boolean
      tradeValue: number
    }>
  ) => {
    if (!userId) return { success: false, error: new Error('Must be logged in') }

    try {
      // Map camelCase to snake_case
      const dbUpdates: Record<string, unknown> = {}
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity
      if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice
      if (updates.currentFillLevel !== undefined) dbUpdates.current_fill_level = updates.currentFillLevel
      if (updates.isOpened !== undefined) dbUpdates.is_opened = updates.isOpened
      if (updates.openedDate !== undefined) dbUpdates.opened_date = updates.openedDate
      if (updates.personalRating !== undefined) dbUpdates.personal_rating = updates.personalRating
      if (updates.personalNotes !== undefined) dbUpdates.personal_notes = updates.personalNotes
      if (updates.storageLocation !== undefined) dbUpdates.storage_location = updates.storageLocation
      if (updates.forTrade !== undefined) dbUpdates.for_trade = updates.forTrade
      if (updates.tradeValue !== undefined) dbUpdates.trade_value = updates.tradeValue

      const { data, error } = await supabase
        .from('bv_user_collections')
        .update(dbUpdates)
        .eq('id', itemId)
        .eq('user_id', userId)
        .select(`
          *,
          spirit:bv_spirits(*)
        `)
        .single()

      if (error) throw error

      const updatedItem = data as CollectionItemWithSpirit

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        )
        return {
          ...prev,
          items: newItems,
          stats: calculateStats(newItems),
        }
      })

      return { success: true, item: updatedItem }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  // Remove item from collection
  const removeFromCollection = async (itemId: string) => {
    if (!userId) return { success: false, error: new Error('Must be logged in') }

    try {
      const { error } = await supabase
        .from('bv_user_collections')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)

      if (error) throw error

      setState(prev => {
        const newItems = prev.items.filter(item => item.id !== itemId)
        return {
          ...prev,
          items: newItems,
          stats: calculateStats(newItems),
        }
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  // Get spirit by ID
  const getSpiritById = async (spiritId: string): Promise<Spirit | null> => {
    try {
      const { data, error } = await supabase
        .from('bv_spirits')
        .select('*')
        .eq('id', spiritId)
        .single()

      if (error) throw error
      return data as Spirit
    } catch {
      return null
    }
  }

  // Filter collection
  const filterCollection = useCallback((
    filters: {
      category?: SpiritCategory
      rarity?: Rarity
      isOpened?: boolean
      forTrade?: boolean
      search?: string
    }
  ): CollectionItemWithSpirit[] => {
    return state.items.filter(item => {
      if (filters.category && item.spirit.category !== filters.category) return false
      if (filters.rarity && item.spirit.rarity !== filters.rarity) return false
      if (filters.isOpened !== undefined && item.is_opened !== filters.isOpened) return false
      if (filters.forTrade !== undefined && item.for_trade !== filters.forTrade) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = item.spirit.name.toLowerCase().includes(searchLower)
        const matchesBrand = item.spirit.brand?.toLowerCase().includes(searchLower)
        const matchesDistillery = item.spirit.distillery?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesBrand && !matchesDistillery) return false
      }
      return true
    })
  }, [state.items])

  // Load collection on mount
  useEffect(() => {
    fetchCollection()
  }, [fetchCollection])

  return {
    ...state,
    fetchCollection,
    fetchSpirits,
    addToCollection,
    updateCollectionItem,
    removeFromCollection,
    getSpiritById,
    filterCollection,
    hasCollection: state.items.length > 0,
  }
}

// Category icons and colors
export const CATEGORY_DISPLAY: Record<SpiritCategory, { icon: string; color: string; label: string }> = {
  bourbon: { icon: '🥃', color: 'amber', label: 'Bourbon' },
  scotch: { icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'orange', label: 'Scotch' },
  irish: { icon: '🍀', color: 'green', label: 'Irish' },
  japanese: { icon: '🇯🇵', color: 'red', label: 'Japanese' },
  wine: { icon: '🍷', color: 'purple', label: 'Wine' },
  beer: { icon: '🍺', color: 'yellow', label: 'Beer' },
  tequila: { icon: '🌵', color: 'lime', label: 'Tequila' },
  rum: { icon: '🏝️', color: 'amber', label: 'Rum' },
  gin: { icon: '🌿', color: 'emerald', label: 'Gin' },
  vodka: { icon: '❄️', color: 'blue', label: 'Vodka' },
  cognac: { icon: '🍇', color: 'violet', label: 'Cognac' },
  sake: { icon: '🍶', color: 'slate', label: 'Sake' },
  liqueurs: { icon: '🍸', color: 'pink', label: 'Liqueurs' },
}

// Rarity display
export const RARITY_DISPLAY: Record<Rarity, { color: string; label: string; bgClass: string }> = {
  common: { color: 'gray', label: 'Common', bgClass: 'bg-gray-500' },
  uncommon: { color: 'green', label: 'Uncommon', bgClass: 'bg-green-500' },
  rare: { color: 'blue', label: 'Rare', bgClass: 'bg-blue-500' },
  very_rare: { color: 'purple', label: 'Very Rare', bgClass: 'bg-purple-500' },
  ultra_rare: { color: 'orange', label: 'Ultra Rare', bgClass: 'bg-orange-500' },
  legendary: { color: 'yellow', label: 'Legendary', bgClass: 'bg-yellow-500' },
}
