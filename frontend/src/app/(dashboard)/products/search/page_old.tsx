"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Star, ShoppingCart, ExternalLink, TrendingUp, Package, Shield, AlertCircle, ChevronDown, Store, Tag, Clock } from "lucide-react"
import { productsApi, type Product, type ProductSearchResponse } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Função para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function ProductSearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchResponse, setSearchResponse] = useState<ProductSearchResponse | null>(null)
  const [sortBy, setSortBy] = useState<"relevance" | "lowest_price" | "highest_price" | "rating">("lowest_price")
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [autoSearchEnabled, setAutoSearchEnabled] = useState(true)
  
  // Debounce da query de busca para busca automática
  const debouncedSearchQuery = useDebounce(searchQuery, 800)

  // Busca automática quando o usuário para de digitar
  useEffect(() => {
    if (autoSearchEnabled && debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, autoSearchEnabled])
  
  // Refazer busca quando sortBy mudar
  useEffect(() => {
    if (products.length > 0) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query || query.length < 2) {
      toast.error("Digite pelo menos 2 caracteres para buscar")
      return
    }

    setIsSearching(true)
    
    try {
      const response = await productsApi.search({
        query,
        max_results: 30,
        sort_by: sortBy
      })
      
      setProducts(response.products)
      setSearchResponse(response)
      
      if (response.products.length === 0) {
        toast.info("Nenhum produto encontrado para esta busca")
      } else {
        toast.success(`${response.products.length} produtos encontrados em ${response.search_time}s`)
      }
    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error)
      toast.error(error.detail || "Erro ao buscar produtos. Tente novamente.")
      setProducts([])
      setSearchResponse(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getTotalStores = () => {
    return searchResponse?.total_stores || 0
  }

  const getMaxDiscount = () => {
    return searchResponse?.max_discount || 0
  }

  const handleVerifyLink = (storeUrl: string) => {
    // Aqui você pode redirecionar para a página de verificação de links
    // passando a URL da loja como parâmetro
    window.open(`/verify?url=${encodeURIComponent(storeUrl)}`, '_blank')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comparar Preços</h1>
        <p className="text-muted-foreground">
          Encontre os melhores preços em lojas verificadas e seguras
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o produto que você procura... Ex: notebook gamer, smart tv 55, iphone 15"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12 text-base"
              />
              <Button onClick={handleSearch} disabled={isSearching} size="lg" className="px-8">
                {isSearching ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
            
            {/* Filtros e configurações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoSearchEnabled}
                    onChange={(e) => setAutoSearchEnabled(e.target.checked)}
                    className="rounded"
                  />
                  Busca em tempo real
                </label>
                
                {products.length > 0 && (
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevância</SelectItem>
                      <SelectItem value="lowest_price">Menor preço</SelectItem>
                      <SelectItem value="highest_price">Maior preço</SelectItem>
                      <SelectItem value="rating">Avaliação</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {searchResponse && (
                <span className="text-sm text-muted-foreground">
                  Busca realizada em {searchResponse.search_time}s
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {products.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos Encontrados
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                produtos comparados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lojas Comparadas
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getTotalStores()}
              </div>
              <p className="text-xs text-muted-foreground">
                todas verificadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Maior Desconto
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getMaxDiscount()}%
              </div>
              <p className="text-xs text-muted-foreground">
                de economia
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {isSearching ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="h-32 w-32 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {/* Product Header */}
              <CardHeader className="bg-muted/30">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2 line-clamp-2">
                      {product.name}
                    </CardTitle>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews} avaliações)
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-sm text-muted-foreground">
                        {product.brand}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price Range */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground">A partir de</span>
                      <span className="text-3xl font-bold text-green-600">
                        R$ {product.lowest_price.toFixed(2)}
                      </span>
                      {product.highest_price > product.lowest_price && (
                        <span className="text-sm text-muted-foreground">
                          até R$ {product.highest_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Store Offers */}
              <CardContent className="p-0">
                <Accordion 
                  type="single" 
                  collapsible 
                  value={expandedProduct === product.id ? product.id : undefined}
                  onValueChange={(value) => setExpandedProduct(value || null)}
                >
                  <AccordionItem value={product.id} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        <span className="font-semibold">
                          Ver ofertas em {product.offers.length} lojas
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4 space-y-3">
                        {product.offers.map((offer) => (
                          <Card key={offer.id} className={`${offer.in_stock ? '' : 'opacity-60'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                {/* Store Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{offer.store_name}</h4>
                                    {offer.is_trusted && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Verificada
                                      </Badge>
                                    )}
                                    {!offer.in_stock && (
                                      <Badge variant="destructive" className="text-xs">
                                        Indisponível
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {offer.store_rating && (
                                    <div className="flex items-center gap-1 mb-2">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm text-muted-foreground">
                                        {offer.store_rating} na loja
                                      </span>
                                    </div>
                                  )}

                                  {offer.installments && (
                                    <p className="text-sm text-muted-foreground">
                                      {offer.installments}
                                    </p>
                                  )}
                                  {offer.shipping && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Frete: {offer.shipping}
                                    </p>
                                  )}
                                </div>

                                {/* Price and Actions */}
                                <div className="flex flex-col items-end gap-2">
                                  <div className="text-right">
                                    {offer.original_price && (
                                      <div className="text-sm text-muted-foreground line-through">
                                        R$ {offer.original_price.toFixed(2)}
                                      </div>
                                    )}
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-2xl font-bold text-green-600">
                                        R$ {offer.price.toFixed(2)}
                                      </span>
                                      {offer.discount && (
                                        <Badge className="bg-red-500">
                                          -{offer.discount}%
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVerifyLink(offer.store_url)}
                                    >
                                      <Shield className="h-4 w-4 mr-1" />
                                      Verificar
                                    </Button>
                                    <Button
                                      size="sm"
                                      disabled={!offer.in_stock}
                                      asChild
                                    >
                                      <a href={offer.product_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Ir à Loja
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Não encontramos produtos para "{searchQuery}". Tente buscar com outras palavras-chave.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Comece sua busca</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Digite o nome do produto que você procura na barra de pesquisa acima
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="cursor-pointer" onClick={() => {
                setSearchQuery("notebook")
                handleSearch()
              }}>
                Notebook
              </Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => {
                setSearchQuery("smartphone")
                handleSearch()
              }}>
                Smartphone
              </Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => {
                setSearchQuery("smart tv")
                handleSearch()
              }}>
                Smart TV
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      {products.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Todas as Lojas são Verificadas pelo NetSaber
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  Cada loja listada passou por nossa verificação de segurança. Analisamos certificados SSL, 
                  reputação, avaliações de clientes e histórico de vendas.
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Dica:</strong> Use o botão "Verificar" para ver detalhes da análise de segurança 
                  de cada loja antes de fazer sua compra.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
