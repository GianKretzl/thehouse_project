"use client"

import { useState, useEffect } from "react"
import { productsApi, type FavoriteProduct } from "@/lib/api"
import { toast } from "sonner"

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await productsApi.getFavorites({ active_only: true })
      setFavorites(response.items)
      setTotal(response.total)
    } catch (error: any) {
      console.error("Erro ao carregar favoritos:", error)
      toast.error("Erro ao carregar favoritos")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: number) => {
    try {
      const favorite = favorites.find(f => f.id === favoriteId)
      if (!favorite) return

      await productsApi.updateFavorite(favoriteId, { is_active: false })
      setFavorites(favorites.filter(f => f.id !== favoriteId))
      setTotal(total - 1)
      toast.success("Produto removido dos favoritos")
    } catch (error: any) {
      console.error("Erro ao remover favorito:", error)
      toast.error("Erro ao remover favorito")
    }
  }

  const updateFavoriteNotes = async (favoriteId: number, notes: string) => {
    try {
      const updated = await productsApi.updateFavorite(favoriteId, { notes })
      setFavorites(favorites.map(f => f.id === favoriteId ? updated : f))
      toast.success("Notas atualizadas")
    } catch (error: any) {
      console.error("Erro ao atualizar notas:", error)
      toast.error("Erro ao atualizar notas")
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  return {
    favorites,
    isLoading,
    total,
    loadFavorites,
    removeFavorite,
    updateFavoriteNotes
  }
}
