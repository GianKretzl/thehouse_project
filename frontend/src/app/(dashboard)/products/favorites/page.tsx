"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Heart, 
  TrendingDown, 
  Bell, 
  Trash2, 
  ExternalLink, 
  Shield,
  Package,
  Plus,
  ArrowUpDown,
  BarChart3
} from "lucide-react"
import { productsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CreatePriceAlertDialog } from "@/components/create-price-alert-dialog"

interface FavoriteProduct {
  id: number
  product_id: string
  product_name: string
  product_image?: string
  product_brand?: string
  product_category?: string
  current_price?: number
  initial_price: number
  lowest_price_seen?: number
  initial_store: string
  initial_store_url: string
  initial_product_url: string
  created_at: string
  price_drop?: number
  alerts_count?: number
}
import Image from "next/image"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteProduct | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [alertFavorite, setAlertFavorite] = useState<FavoriteProduct | null>(null)
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadFavorites()
  }, [])
  
  const toggleComparisonSelection = (id: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      } else if (prev.length >= 5) {
        toast({
          title: "Limite atingido",
          description: "Você pode comparar no máximo 5 produtos por vez.",
          variant: "destructive"
        })
        return prev
      } else {
        return [...prev, id]
      }
    })
  }

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getFavorites({ active_only: true })
      setFavorites(response.items)
    } catch (error: any) {
      console.error("Error loading favorites:", error)
      toast({
        title: "Erro ao carregar favoritos",
        description: error.detail || "Não foi possível carregar seus favoritos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favorite: FavoriteProduct) => {
    try {
      await productsApi.removeFavorite(favorite.product_id)
      setFavorites(favorites.filter(f => f.id !== favorite.id))
      setDeleteDialogOpen(false)
      toast({
        title: "Removido dos favoritos",
        description: `${favorite.product_name} foi removido dos seus favoritos.`,
      })
    } catch (error: any) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto dos favoritos.",
        variant: "destructive",
      })
    }
  }

  const getPriceDrop = (favorite: FavoriteProduct) => {
    if (!favorite.current_price || !favorite.price_drop) return null
    const percentage = ((favorite.price_drop / favorite.initial_price) * 100).toFixed(0)
    return {
      amount: favorite.price_drop,
      percentage: parseInt(percentage)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando favoritos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            Meus Favoritos
          </h1>
          <p className="text-muted-foreground mt-1">
            {favorites.length} {favorites.length === 1 ? "produto salvo" : "produtos salvos"}
            {selectedForComparison.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {selectedForComparison.length} selecionados
              </Badge>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedForComparison.length >= 2 && (
            <Button asChild variant="outline">
              <Link href={`/products/compare?ids=${selectedForComparison.join(',')}`}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Comparar ({selectedForComparison.length})
              </Link>
            </Button>
          )}
          <Link href="/products/search">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produtos
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Economizado</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {favorites.reduce((sum, f) => sum + (f.price_drop || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              em quedas de preço
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {favorites.length}
            </div>
            <p className="text-xs text-muted-foreground">
              produtos monitorados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menor Preço</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {Math.min(...favorites.map(f => f.current_price || f.initial_price)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              melhor oferta atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Favoritos */}
      {favorites.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground mb-6">
              Comece a adicionar produtos para acompanhar preços e receber alertas!
            </p>
            <Link href="/products/search">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Buscar Produtos
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const priceDrop = getPriceDrop(favorite)
            const currentPrice = favorite.current_price || favorite.initial_price
            
            return (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-muted/30 to-muted/50">
                  {favorite.product_image ? (
                    <Image
                      src={favorite.product_image}
                      alt={favorite.product_name}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Checkbox para seleção */}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md p-1">
                    <Checkbox
                      checked={selectedForComparison.includes(favorite.id)}
                      onCheckedChange={() => toggleComparisonSelection(favorite.id)}
                    />
                  </div>
                  
                  {priceDrop && priceDrop.percentage > 0 && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -{priceDrop.percentage}%
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                    {favorite.product_name}
                  </h3>

                  {favorite.product_brand && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {favorite.product_brand}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {currentPrice.toFixed(2)}
                      </span>
                      {favorite.initial_price !== currentPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {favorite.initial_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {priceDrop && priceDrop.amount > 0 && (
                      <p className="text-xs text-green-600 font-medium">
                        Você economizou R$ {priceDrop.amount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">
                    <p>Loja: <span className="font-medium text-foreground">{favorite.initial_store}</span></p>
                    <p className="text-xs text-muted-foreground">
                      Adicionado em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      title="Ver histórico de preços"
                    >
                      <Link href={`/products/history/${favorite.product_id}`}>
                        <BarChart3 className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertFavorite(favorite)
                        setAlertDialogOpen(true)
                      }}
                      title="Criar alerta de preço"
                    >
                      <Bell className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(favorite.initial_product_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFavorite(favorite)
                        setDeleteDialogOpen(true)
                      }}
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dos favoritos?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFavorite && (
                <>
                  Tem certeza que deseja remover <strong>{selectedFavorite.product_name}</strong> dos seus favoritos?
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedFavorite && handleRemoveFavorite(selectedFavorite)}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Price Alert Dialog */}
      {alertFavorite && (
        <CreatePriceAlertDialog
          open={alertDialogOpen}
          onOpenChange={setAlertDialogOpen}
          favorite={alertFavorite}
          onAlertCreated={() => {
            toast({
              title: "Sucesso!",
              description: "Alerta de preço criado com sucesso.",
            })
          }}
        />
      )}
    </div>
  )
}
