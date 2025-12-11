"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  TrendingUp, 
  Package, 
  Shield, 
  Filter as FilterIcon,
  Heart,
  Bell,
  History,
  GitCompare,
  SlidersHorizontal,
  Star,
  Clock,
  ChevronRight,
  Trash2,
  Edit,
  X,
  DollarSign,
  TrendingDown,
  AlertCircle,
  HelpCircle,
  Info
} from "lucide-react"
import { productsApi, type Product, type ProductSearchResponse, type FavoriteProduct, type PriceAlert } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoriesCarousel } from "@/components/categories-carousel"
import { ProductCardIfoodStyle } from "@/components/product-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFavorites } from "@/hooks/use-favorites"
import { usePriceAlerts } from "@/hooks/use-price-alerts"
import { useSearchHistory } from "@/hooks/use-search-history"
import { Textarea } from "@/components/ui/textarea"

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
  const [autoSearchEnabled, setAutoSearchEnabled] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isExplainDialogOpen, setIsExplainDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"results" | "favorites" | "history" | "compare" | "alerts">("results")
  
  // Hooks personalizados
  const { favorites, isLoading: loadingFavorites, removeFavorite, updateFavoriteNotes, loadFavorites } = useFavorites()
  const { alerts, isLoading: loadingAlerts, createAlert, updateAlert, deleteAlert, activeCount, triggeredCount } = usePriceAlerts()
  const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory()
  
  // Estados para comparação
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([])
  
  // Estados para criar alerta
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [alertProduct, setAlertProduct] = useState<FavoriteProduct | null>(null)
  const [targetPrice, setTargetPrice] = useState("")
  const [alertType, setAlertType] = useState<"below" | "above" | "exact">("below")
  
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
        sort_by: sortBy,
        category: selectedCategory || undefined
      })
      
      setProducts(response.products)
      setSearchResponse(response)
      
      // Adiciona ao histórico
      addToHistory(query, selectedCategory)
      
      if (response.products.length === 0) {
        toast.info("Nenhum produto encontrado para esta busca")
      } else {
        toast.success(`${response.products.length} produtos encontrados!`)
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
    router.push(`/verify?url=${encodeURIComponent(storeUrl)}`)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsProductDialogOpen(true)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    if (searchQuery && searchQuery.length >= 2) {
      handleSearch()
    }
  }

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query)
    setTimeout(() => handleSearch(), 100)
  }

  const getSimpleExplanation = (product: Product) => {
    const specs = []
    
    // Identificar tipo de produto e extrair specs relevantes
    const name = product.name.toLowerCase()
    const desc = (product.description || "").toLowerCase()
    
    if (name.includes("notebook") || name.includes("laptop")) {
      return {
        type: "Notebook/Laptop",
        icon: "💻",
        what: "Um notebook é um computador portátil que você pode carregar para qualquer lugar. É como ter um computador completo que cabe em uma mochila.",
        why: "Perfeito para trabalhar, estudar, assistir filmes e navegar na internet onde você estiver.",
        specs: [
          { label: "Processador", value: "É o 'cérebro' do notebook. Quanto mais moderno (i5, i7, Ryzen), mais rápido ele funciona.", icon: "🧠" },
          { label: "Memória RAM", value: "É como a 'mesa de trabalho'. Quanto mais RAM (8GB, 16GB), mais programas você pode usar ao mesmo tempo.", icon: "⚡" },
          { label: "Armazenamento", value: "É o 'armário' onde ficam seus arquivos. SSD é mais rápido que HD. 256GB ou 512GB são bons tamanhos.", icon: "💾" },
          { label: "Tela", value: "O tamanho é medido em polegadas. 15.6\" é o padrão, bom para assistir e trabalhar.", icon: "📺" }
        ],
        tips: [
          "Para uso básico (internet, vídeos): 8GB RAM e i3/i5 são suficientes",
          "Para trabalho pesado (edição): escolha 16GB RAM e i7",
          "SSD é muito mais rápido que HD - vale a pena!",
          "Bateria: procure por 'até 8 horas' ou mais"
        ]
      }
    } else if (name.includes("celular") || name.includes("smartphone") || name.includes("iphone") || name.includes("galaxy")) {
      return {
        type: "Celular/Smartphone",
        icon: "📱",
        what: "Um celular inteligente que faz muito mais do que ligar. É como ter um mini computador no bolso.",
        why: "Para fazer ligações, mandar mensagens, tirar fotos, usar redes sociais, GPS e muito mais.",
        specs: [
          { label: "Câmera", value: "Medida em megapixels (MP). Quanto mais, melhor a foto. Procure por 12MP ou mais.", icon: "📸" },
          { label: "Memória", value: "64GB é básico, 128GB é bom, 256GB é ótimo para muitas fotos e apps.", icon: "💾" },
          { label: "Bateria", value: "Medida em mAh. Quanto maior (4000mAh+), mais tempo dura sem carregar.", icon: "🔋" },
          { label: "Tela", value: "Tamanho em polegadas. 6.0\" a 6.5\" é o padrão confortável.", icon: "📺" }
        ],
        tips: [
          "Para fotos boas: procure câmera de 48MP ou mais",
          "Bateria de 5000mAh dura o dia todo",
          "128GB de memória é o ideal hoje em dia",
          "Processador Snapdragon ou Apple são os melhores"
        ]
      }
    } else if (name.includes("tv") || name.includes("televisão")) {
      return {
        type: "TV/Televisão",
        icon: "📺",
        what: "Uma televisão moderna para assistir seus programas, filmes e séries favoritos.",
        why: "Entretenimento para toda a família com qualidade de imagem.",
        specs: [
          { label: "Tamanho", value: "Medido em polegadas. 32\" para quartos, 43\"-50\" para salas pequenas, 55\"+ para salas grandes.", icon: "📏" },
          { label: "Resolução", value: "Full HD (boa), 4K/UHD (ótima - 4x mais nítida). 4K é o padrão atual.", icon: "🎬" },
          { label: "Smart TV", value: "Se é Smart, tem apps como Netflix, YouTube direto na TV, sem precisar de outro aparelho.", icon: "📱" },
          { label: "HDR", value: "Deixa as cores mais vivas e bonitas. É um bônus interessante.", icon: "🌈" }
        ],
        tips: [
          "Para sala: escolha 50\" ou mais",
          "4K vale a pena mesmo em TVs menores",
          "Smart TV economiza ter que comprar outro aparelho",
          "Procure por HDMI 2.0 ou superior para conectar videogames"
        ]
      }
    } else if (name.includes("geladeira") || name.includes("refrigerador")) {
      return {
        type: "Geladeira/Refrigerador",
        icon: "❄️",
        what: "Eletrodoméstico para conservar seus alimentos frescos e gelados.",
        why: "Essencial para manter comidas e bebidas na temperatura ideal.",
        specs: [
          { label: "Capacidade", value: "Medida em litros. 300L serve 2-3 pessoas, 400L+ para famílias maiores.", icon: "📦" },
          { label: "Frost Free", value: "Não forma gelo! Não precisa descongelar. Muito mais prático.", icon: "✨" },
          { label: "Consumo", value: "Selo Procel A é o mais econômico. Economiza na conta de luz.", icon: "💡" },
          { label: "Portas", value: "1 porta (simples), 2 portas (freezer separado), Duplex ou Inverse.", icon: "🚪" }
        ],
        tips: [
          "Frost Free vale cada centavo - sem gelo chato!",
          "Selo A é mais caro, mas economiza muito na luz",
          "2 portas é mais prático para organizar",
          "Meça bem o espaço antes de comprar"
        ]
      }
    } else {
      return {
        type: "Produto",
        icon: "📦",
        what: "Este produto pode ajudar você no seu dia a dia.",
        why: "Compare preços e escolha a melhor oferta com segurança.",
        specs: [
          { label: "Marca", value: product.brand || "Verifique a marca na descrição", icon: "🏷️" },
          { label: "Preço", value: `R$ ${product.lowest_price.toFixed(2)} - melhor preço encontrado`, icon: "💰" },
          { label: "Avaliação", value: product.rating ? `${product.rating} estrelas` : "Verifique avaliações", icon: "⭐" },
        ],
        tips: [
          "Sempre compare preços em várias lojas",
          "Leia as avaliações de outros compradores",
          "Verifique a reputação da loja",
          "Fique atento ao prazo de entrega"
        ]
      }
    }
  }

  const handleToggleCompare = (favoriteId: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(favoriteId)) {
        return prev.filter(id => id !== favoriteId)
      } else if (prev.length < 5) {
        return [...prev, favoriteId]
      } else {
        toast.error("Máximo de 5 produtos para comparar")
        return prev
      }
    })
  }

  const handleCreateAlert = async () => {
    if (!alertProduct || !targetPrice) {
      toast.error("Preencha todos os campos")
      return
    }

    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) {
      toast.error("Preço inválido")
      return
    }

    try {
      await createAlert({
        favorite_product_id: alertProduct.id,
        target_price: price,
        alert_type: alertType
      })
      setShowCreateAlert(false)
      setAlertProduct(null)
      setTargetPrice("")
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header com Navegação por Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Busca de Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Compare preços, gerencie favoritos e configure alertas
          </p>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 gap-1">
          <TabsTrigger value="results" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Buscar</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <Heart className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Favoritos</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <History className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <GitCompare className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Comparar</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resultados de Busca */}
        <TabsContent value="results" className="space-y-6 mt-6">
          {/* Barra de Busca Principal */}
          <Card className="border-2">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                  <Input
                    placeholder="Digite o que você está procurando..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-10 sm:h-12 pl-10 sm:pl-12 pr-4 text-sm sm:text-base"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching} 
                  size="lg"
                  className="h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto"
                >
                  {isSearching ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      <span className="text-sm sm:text-base">Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                      <span className="text-sm sm:text-base">Buscar</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Termos Populares */}
              {!products.length && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Buscas populares:</span>
                  {["iPhone 15", "Notebook Gamer", "Smart TV 55", "AirPods", "PlayStation 5"].map((term) => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs whitespace-nowrap"
                      onClick={() => handlePopularSearch(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carousel de Categorias */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Categorias</h2>
            <CategoriesCarousel 
              onCategorySelect={handleCategorySelect}
              activeCategory={selectedCategory}
            />
          </div>

          {/* Filtros e Estatísticas */}
          {products.length > 0 && (
            <>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Ordenar:</span>
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevância</SelectItem>
                            <SelectItem value="lowest_price">Menor preço</SelectItem>
                            <SelectItem value="highest_price">Maior preço</SelectItem>
                            <SelectItem value="rating">Avaliação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {searchResponse && (
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                        <Badge variant="secondary" className="whitespace-nowrap">{searchResponse.total_products} produtos</Badge>
                        <Badge variant="secondary" className="whitespace-nowrap">{searchResponse.total_stores} lojas</Badge>
                        {searchResponse.max_discount > 0 && (
                          <Badge className="bg-red-500 whitespace-nowrap">até {searchResponse.max_discount}% off</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Produtos Encontrados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                        <Package className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold">{products.length}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Lojas Verificadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                        <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold">{getTotalStores()}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2 md:col-span-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Maior Desconto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                        <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold">{getMaxDiscount()}%</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Grid de Produtos */}
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Resultados para "{searchQuery}"
                </h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {searchResponse?.search_time}s
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCardIfoodStyle
                    key={product.id}
                    product={product}
                    onVerifyClick={handleVerifyLink}
                    onProductClick={handleProductClick}
                    onExplainClick={(product) => {
                      setSelectedProduct(product)
                      setIsExplainDialogOpen(true)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Não encontramos produtos para "{searchQuery}". Tente buscar com outras palavras-chave.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Limpar busca
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-6">
                  <Search className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Comece sua busca</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Use a barra de pesquisa acima para encontrar os melhores preços
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Favoritos */}
        <TabsContent value="favorites" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Produtos Favoritos
                  </CardTitle>
                  <CardDescription>
                    Acompanhe mudanças de preço nos produtos que você mais gosta
                  </CardDescription>
                </div>
                {favorites.length > 0 && (
                  <Badge variant="secondary">{favorites.length} produtos</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingFavorites ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="space-y-4">
                  {favorites.map((fav) => (
                    <Card key={fav.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Imagem */}
                          <div className="w-20 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {fav.product_image ? (
                              <img src={fav.product_image} alt={fav.product_name} className="max-w-full max-h-full object-contain p-2" />
                            ) : (
                              <Package className="h-10 w-10 text-muted-foreground" />
                            )}
                          </div>

                          {/* Informações */}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{fav.product_name}</h4>
                            {fav.product_brand && (
                              <p className="text-sm text-muted-foreground mb-2">{fav.product_brand}</p>
                            )}
                            
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Preço inicial</p>
                                <p className="font-semibold">R$ {fav.initial_price.toFixed(2)}</p>
                              </div>
                              {fav.current_price && (
                                <>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Preço atual</p>
                                    <p className={`font-semibold ${fav.current_price < fav.initial_price ? 'text-green-600' : ''}`}>
                                      R$ {fav.current_price.toFixed(2)}
                                    </p>
                                  </div>
                                </>
                              )}
                              {fav.price_drop && fav.price_drop > 0 && (
                                <Badge className="bg-green-600">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  -{fav.price_drop.toFixed(1)}%
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAlertProduct(fav)
                                setShowCreateAlert(true)
                              }}
                            >
                              <Bell className="h-4 w-4 mr-1" />
                              Alerta
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleCompare(fav.id)}
                            >
                              <GitCompare className="h-4 w-4 mr-1" />
                              {selectedForCompare.includes(fav.id) ? "✓" : "Comparar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFavorite(fav.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem produtos favoritos
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("results")}>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Produtos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Buscas
                  </CardTitle>
                  <CardDescription>
                    Suas buscas recentes para facilitar consultas futuras
                  </CardDescription>
                </div>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer group"
                      onClick={() => {
                        setSearchQuery(item.query)
                        if (item.category) setSelectedCategory(item.category)
                        setActiveTab("results")
                        setTimeout(() => handleSearch(), 100)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.query}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {item.category && (
                          <Badge variant="outline" className="ml-2">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromHistory(item.query)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Seu histórico de buscas aparecerá aqui
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("results")}>
                    <Search className="mr-2 h-4 w-4" />
                    Fazer uma Busca
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Comparar */}
        <TabsContent value="compare" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5" />
                    Comparar Produtos
                  </CardTitle>
                  <CardDescription>
                    Compare até 5 produtos lado a lado ({selectedForCompare.length}/5)
                  </CardDescription>
                </div>
                {selectedForCompare.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedForCompare([])}
                  >
                    Limpar seleção
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedForCompare.length >= 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedForCompare.map(favId => {
                    const fav = favorites.find(f => f.id === favId)
                    if (!fav) return null

                    return (
                      <Card key={fav.id}>
                        <CardContent className="p-4">
                          <div className="relative">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => handleToggleCompare(fav.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>

                            <div className="w-full h-32 bg-muted rounded mb-3 flex items-center justify-center">
                              {fav.product_image ? (
                                <img src={fav.product_image} alt={fav.product_name} className="max-w-full max-h-full object-contain p-2" />
                              ) : (
                                <Package className="h-16 w-16 text-muted-foreground" />
                              )}
                            </div>

                            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{fav.product_name}</h4>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Preço inicial:</span>
                                <span className="font-medium">R$ {fav.initial_price.toFixed(2)}</span>
                              </div>
                              
                              {fav.current_price && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Preço atual:</span>
                                  <span className={`font-medium ${fav.current_price < fav.initial_price ? 'text-green-600' : ''}`}>
                                    R$ {fav.current_price.toFixed(2)}
                                  </span>
                                </div>
                              )}

                              {fav.lowest_price_seen && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Menor preço:</span>
                                  <span className="font-medium text-green-600">R$ {fav.lowest_price_seen.toFixed(2)}</span>
                                </div>
                              )}

                              {fav.price_drop !== undefined && fav.price_drop > 0 && (
                                <Badge className="w-full bg-green-600 justify-center">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  Queda de {fav.price_drop.toFixed(1)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : selectedForCompare.length === 1 ? (
                <div className="text-center py-8">
                  <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Selecione pelo menos mais um produto para comparar
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("favorites")}>
                    <Heart className="mr-2 h-4 w-4" />
                    Ver Favoritos
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Selecione produtos favoritos para comparar
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("favorites")}>
                    <Heart className="mr-2 h-4 w-4" />
                    Ver Favoritos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Alertas de Preço
                  </CardTitle>
                  <CardDescription>
                    Seja notificado quando o preço atingir o valor desejado
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{activeCount} ativos</Badge>
                  <Badge className="bg-green-600">{triggeredCount} disparados</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className={alert.is_triggered ? "border-green-500" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">
                                {alert.favorite_product?.product_name || "Produto"}
                              </h4>
                              {alert.is_triggered && (
                                <Badge className="bg-green-600">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Disparado!
                                </Badge>
                              )}
                              {!alert.is_active && (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Preço alvo: </span>
                                <span className="font-semibold">R$ {alert.target_price.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tipo: </span>
                                <span className="capitalize">
                                  {alert.alert_type === "below" ? "Abaixo" : alert.alert_type === "above" ? "Acima" : "Igual"}
                                </span>
                              </div>
                              {alert.is_triggered && alert.triggered_price && (
                                <div className="text-green-600">
                                  <DollarSign className="h-4 w-4 inline mr-1" />
                                  R$ {alert.triggered_price.toFixed(2)}
                                </div>
                              )}
                            </div>

                            {alert.is_triggered && alert.triggered_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Disparado em {new Date(alert.triggered_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAlert(alert.id, { is_active: !alert.is_active })}
                            >
                              {alert.is_active ? "Desativar" : "Ativar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAlert(alert.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem alertas configurados
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("favorites")}>
                    <Heart className="mr-2 h-4 w-4" />
                    Ver Favoritos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar Alerta */}
      <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Alerta de Preço</DialogTitle>
            <DialogDescription>
              Seja notificado quando o preço atingir o valor desejado
            </DialogDescription>
          </DialogHeader>
          
          {alertProduct && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{alertProduct.product_name}</h4>
                <div className="text-sm text-muted-foreground">
                  Preço atual: R$ {(alertProduct.current_price || alertProduct.initial_price).toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Alvo (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Alerta</label>
                <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below">Abaixo do preço</SelectItem>
                    <SelectItem value="above">Acima do preço</SelectItem>
                    <SelectItem value="exact">Exatamente o preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateAlert(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAlert}>
                  <Bell className="mr-2 h-4 w-4" />
                  Criar Alerta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Explicação Simples */}
      {selectedProduct && (
        <Dialog open={isExplainDialogOpen} onOpenChange={setIsExplainDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span className="text-2xl">{getSimpleExplanation(selectedProduct).icon}</span>
                Explicação Simples: {getSimpleExplanation(selectedProduct).type}
              </DialogTitle>
              <DialogDescription>
                Entenda tudo sobre este produto em uma linguagem simples
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {(() => {
                const explanation = getSimpleExplanation(selectedProduct)
                return (
                  <>
                    {/* O que é */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        O que é?
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200">{explanation.what}</p>
                    </div>

                    {/* Para que serve */}
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Para que serve?
                      </h4>
                      <p className="text-green-800 dark:text-green-200">{explanation.why}</p>
                    </div>

                    {/* Especificações explicadas */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Entendendo as Especificações
                      </h4>
                      <div className="space-y-3">
                        {explanation.specs.map((spec, idx) => (
                          <div key={idx} className="border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">{spec.icon}</span>
                              <div>
                                <h5 className="font-semibold text-sm mb-1">{spec.label}</h5>
                                <p className="text-sm text-muted-foreground">{spec.value}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dicas */}
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                        💡 Dicas Importantes
                      </h4>
                      <ul className="space-y-2">
                        {explanation.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
                            <span className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botão para ver ofertas */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsExplainDialogOpen(false)}>
                        Fechar
                      </Button>
                      <Button onClick={() => {
                        setIsExplainDialogOpen(false)
                        setIsProductDialogOpen(true)
                      }}>
                        Ver Ofertas do Produto
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Detalhes do Produto */}
      {selectedProduct && (
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Compare ofertas de {selectedProduct.offers.length} lojas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Botão de Ajuda */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsProductDialogOpen(false)
                    setIsExplainDialogOpen(true)
                  }}
                  className="gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Não entendo essas especificações
                </Button>
              </div>

              {/* Informações do Produto */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-48 h-48 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  {selectedProduct.image ? (
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="max-w-full max-h-full object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<svg class="h-20 w-20 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                        }
                      }}
                    />
                  ) : (
                    <Package className="h-20 w-20 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                    {selectedProduct.brand && (
                      <Badge variant="secondary" className="text-xs sm:text-sm">{selectedProduct.brand}</Badge>
                    )}
                    {selectedProduct.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-sm sm:text-base">{selectedProduct.rating}</span>
                        {selectedProduct.reviews && (
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            ({selectedProduct.reviews} avaliações)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm sm:text-base text-muted-foreground break-words">{selectedProduct.description}</p>
                  
                  <div className="mt-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">A partir de</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      R$ {selectedProduct.lowest_price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Ofertas */}
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Ofertas Disponíveis ({selectedProduct.offers.length})</h4>
                <div className="space-y-3">
                  {selectedProduct.offers.map((offer) => (
                    <Card key={offer.id}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h5 className="font-semibold text-sm sm:text-base break-words">{offer.store_name}</h5>
                              {offer.is_trusted && (
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verificada
                                </Badge>
                              )}
                            </div>
                            {offer.installments && (
                              <p className="text-xs sm:text-sm text-muted-foreground break-words">{offer.installments}</p>
                            )}
                            {offer.shipping && (
                              <p className="text-xs sm:text-sm text-muted-foreground break-words">Frete: {offer.shipping}</p>
                            )}
                          </div>
                          
                          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2">
                            {offer.original_price && (
                              <div className="text-xs sm:text-sm text-muted-foreground line-through">
                                R$ {offer.original_price.toFixed(2)}
                              </div>
                            )}
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-xl sm:text-2xl font-bold text-green-600">
                                R$ {offer.price.toFixed(2)}
                              </span>
                              {offer.discount && (
                                <Badge className="bg-red-500 whitespace-nowrap">-{offer.discount}%</Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none text-xs sm:text-sm"
                                onClick={() => {
                                  handleVerifyLink(offer.store_url)
                                  setIsProductDialogOpen(false)
                                }}
                              >
                                <Shield className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                                Verificar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-xs sm:text-sm"
                                asChild
                              >
                                <a href={offer.product_url} target="_blank" rel="noopener noreferrer">
                                  Comprar
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
