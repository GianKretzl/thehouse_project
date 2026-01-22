/**
 * Simple in-memory cache with TTL (Time To Live)
 */

import { dedupe } from './dedupe'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // Expired, remove from cache
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  /**
   * Set data in cache with TTL in milliseconds
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 30 seconds)
   */
  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Clear specific key or entire cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }
}

export const cache = new SimpleCache()

/**
 * Wrapper for async functions with caching and deduplication
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 30000
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Deduplicate concurrent requests and cache result
  return dedupe(key, async () => {
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  })
}
