"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "netsaber-search-history"
const MAX_HISTORY_ITEMS = 20

export interface SearchHistoryItem {
  query: string
  timestamp: string
  category?: string
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    // Carregar histórico do localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error("Erro ao carregar histórico:", e)
      }
    }
  }, [])

  const addToHistory = (query: string, category?: string) => {
    if (!query || query.length < 2) return

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
      category
    }

    setHistory(prev => {
      // Remove duplicatas (mesma query)
      const filtered = prev.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      )

      // Adiciona novo item no início
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)

      // Salva no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const removeFromHistory = (query: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.query !== query)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
}
