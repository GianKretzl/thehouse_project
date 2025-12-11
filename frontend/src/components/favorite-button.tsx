"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { productsApi } from "@/lib/api"
import { Product } from "@/types/product"

interface FavoriteButtonProps {
  product: Product
  className?: string
}

export function FavoriteButton({ product, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkIsFavorite()
  }, [product.id])

  const checkIsFavorite = async () => {
    try {
      const response = await productsApi.getFavorites()
      const isFav = response.items.some((fav: any) => fav.product_id === product.id)
      setIsFavorited(isFav)
    } catch (error) {
      console.error("Error checking favorite:", error)
    }
  }

  const handleToggleFavorite = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await productsApi.getFavorites()
        const favorite = response.items.find((fav: any) => fav.product_id === product.id)
        if (favorite) {
          await productsApi.removeFavorite(favorite.id.toString())
          setIsFavorited(false)
          toast({
            title: "Removido dos favoritos",
            description: `${product.name} foi removido dos seus favoritos.`,
          })
        }
      } else {
        // Add to favorites
        await productsApi.addFavorite({
          product_id: product.id,
          product_name: product.name,
          product_image: product.image,
          product_brand: product.brand,
          product_category: product.category,
          initial_price: product.lowest_price,
          initial_store: product.offers[0].store_name,
          initial_store_url: product.offers[0].store_url,
          initial_product_url: product.offers[0].product_url,
        })
        setIsFavorited(true)
        toast({
          title: "Adicionado aos favoritos",
          description: `${product.name} foi adicionado aos seus favoritos.`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      <Heart
        className={`h-5 w-5 ${
          isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </Button>
  )
}
