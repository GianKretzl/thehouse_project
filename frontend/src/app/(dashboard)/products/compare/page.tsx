"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  TrendingDown,
  Store,
  Package,
  Truck,
  CreditCard,
  Star
} from "lucide-react"
import { productsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface ComparisonProduct {
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
  best_offer?: {
    store_name: string
    price: number
    shipping?: string
    installments?: string
  }
}

export default function ProductComparePage() {
  const [products, setProducts] = useState<ComparisonProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const productIds = searchParams.get("ids")?.split(",") || []

  useEffect(() => {
    if (productIds.length === 0) {
      router.push("/products/favorites")
      return
    }
    
    if (productIds.length > 5) {
      toast({
        title: "Limite excedido",
        description: "Você pode comparar no máximo 5 produtos por vez.",
        variant: "destructive"
      })
      return
    }
    
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.compareProducts(productIds.map(Number))
      setProducts(response.products || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos para comparação.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getComparisonRows = () => {
    if (products.length === 0) return []
    
    return [
      {
        label: "Imagem",
        type: "image",
        getValue: (p: ComparisonProduct) => p.product_image
      },
      {
        label: "Nome do Produto",
        type: "text",
        getValue: (p: ComparisonProduct) => p.product_name
      },
      {
        label: "Marca",
        type: "text",
        getValue: (p: ComparisonProduct) => p.product_brand || "-"
      },
      {
        label: "Categoria",
        type: "badge",
        getValue: (p: ComparisonProduct) => p.product_category || "-"
      },
      {
        label: "Preço Atual",
        type: "price",
        getValue: (p: ComparisonProduct) => p.current_price || p.initial_price,
        highlight: true
      },
      {
        label: "Preço Inicial",
        type: "price",
        getValue: (p: ComparisonProduct) => p.initial_price
      },
      {
        label: "Menor Preço Visto",
        type: "price",
        getValue: (p: ComparisonProduct) => p.lowest_price_seen || p.initial_price,
        highlight: "best"
      },
      {
        label: "Queda de Preço",
        type: "percentage",
        getValue: (p: ComparisonProduct) => p.price_drop || 0
      },
      {
        label: "Loja",
        type: "text",
        getValue: (p: ComparisonProduct) => p.initial_store
      },
      {
        label: "Link",
        type: "link",
        getValue: (p: ComparisonProduct) => p.initial_product_url
      }
    ]
  }

  const getBestValueIndex = () => {
    if (products.length === 0) return -1
    
    const prices = products.map(p => p.current_price || p.initial_price)
    const minPrice = Math.min(...prices)
    return prices.indexOf(minPrice)
  }

  const getBestDiscountIndex = () => {
    if (products.length === 0) return -1
    
    const discounts = products.map(p => p.price_drop || 0)
    const maxDiscount = Math.max(...discounts)
    return discounts.indexOf(maxDiscount)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando comparação...</p>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum produto para comparar</h2>
            <p className="text-muted-foreground mb-4">
              Selecione produtos nos seus favoritos para compará-los.
            </p>
            <Button asChild>
              <Link href="/products/favorites">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos Favoritos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bestValueIdx = getBestValueIndex()
  const bestDiscountIdx = getBestDiscountIndex()

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Comparação de Produtos</h1>
          <p className="text-muted-foreground">
            Comparando {products.length} {products.length === 1 ? "produto" : "produtos"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/products/favorites">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Melhor Preço</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {Math.min(...products.map(p => p.current_price || p.initial_price)).toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maior Desconto</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.max(...products.map(p => p.price_drop || 0)).toFixed(1)}%
                </p>
              </div>
              <Badge className="bg-orange-600">OFF</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diferença de Preço</p>
                <p className="text-2xl font-bold">
                  R$ {(
                    Math.max(...products.map(p => p.current_price || p.initial_price)) -
                    Math.min(...products.map(p => p.current_price || p.initial_price))
                  ).toFixed(2)}
                </p>
              </div>
              <Store className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold bg-muted/50 sticky left-0 z-10">
                    Característica
                  </th>
                  {products.map((product, idx) => (
                    <th key={product.id} className="p-4 text-center relative">
                      {idx === bestValueIdx && (
                        <Badge className="absolute top-2 left-2 bg-green-600">
                          Melhor Preço
                        </Badge>
                      )}
                      {idx === bestDiscountIdx && idx !== bestValueIdx && (
                        <Badge className="absolute top-2 left-2 bg-orange-600">
                          Maior Desconto
                        </Badge>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getComparisonRows().map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium bg-muted/30 sticky left-0">
                      {row.label}
                    </td>
                    {products.map((product, colIdx) => {
                      const value = row.getValue(product)
                      const isHighlight = row.highlight === true || 
                        (row.highlight === "best" && colIdx === bestValueIdx)
                      
                      return (
                        <td key={product.id} className={`p-4 text-center ${isHighlight ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                          {row.type === "image" && (
                            value ? (
                              <Image
                                src={value as string}
                                alt={product.product_name}
                                width={100}
                                height={100}
                                className="mx-auto rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-muted rounded-lg mx-auto flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )
                          )}
                          
                          {row.type === "text" && (
                            <span className={isHighlight ? 'font-semibold' : ''}>
                              {value}
                            </span>
                          )}
                          
                          {row.type === "badge" && (
                            <Badge variant="outline">{value}</Badge>
                          )}
                          
                          {row.type === "price" && (
                            <div className="text-lg font-bold text-green-600">
                              R$ {(value as number).toFixed(2)}
                            </div>
                          )}
                          
                          {row.type === "percentage" && (
                            typeof value === 'number' && value > 0 ? (
                              <Badge className="bg-red-600">
                                🔥 -{value.toFixed(1)}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          )}
                          
                          {row.type === "link" && (
                            <Button size="sm" asChild>
                              <a href={value as string} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Produto
                              </a>
                            </Button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="mt-6 border-green-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="mr-2 h-5 w-5 text-green-600" />
            Nossa Recomendação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {products[bestValueIdx].product_image && (
              <Image
                src={products[bestValueIdx].product_image}
                alt={products[bestValueIdx].product_name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                {products[bestValueIdx].product_name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  {products[bestValueIdx].initial_store}
                </span>
                {products[bestValueIdx].product_brand && (
                  <span>Marca: {products[bestValueIdx].product_brand}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {(products[bestValueIdx].current_price || products[bestValueIdx].initial_price).toFixed(2)}
                  </p>
                  {products[bestValueIdx].price_drop && products[bestValueIdx].price_drop! > 0 && (
                    <Badge className="mt-1 bg-red-600">
                      🔥 -{products[bestValueIdx].price_drop!.toFixed(1)}% OFF
                    </Badge>
                  )}
                </div>
                <Button size="lg" asChild className="ml-auto">
                  <a href={products[bestValueIdx].initial_product_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Comprar Agora
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm">
              ✅ Este produto oferece o melhor custo-benefício entre as opções selecionadas,
              considerando preço atual, desconto e disponibilidade.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
