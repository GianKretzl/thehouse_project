"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Package } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PriceHistoryChart } from "@/components/price-history-chart"
import Link from "next/link"

interface PricePoint {
  price: number
  store_name: string
  store_url: string
  product_url: string
  original_price?: number
  discount?: number
  in_stock: boolean
  shipping?: string
  installments?: string
  recorded_at: string
}

interface PriceStatistics {
  lowest_price: number
  highest_price: number
  average_price: number
  current_price: number
  price_trend: "up" | "down" | "stable"
  volatility: number
  data_points: number
}

interface HistoryData {
  product_id: string
  product_name: string
  product_image?: string
  product_brand?: string
  history: PricePoint[]
  statistics: PriceStatistics
  days: number
}

export default function PriceHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [selectedDays, setSelectedDays] = useState(30)
  
  const productId = params.productId as string

  useEffect(() => {
    loadHistory()
  }, [productId, selectedDays])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await productsApi.getPriceHistory(productId, selectedDays)
      setHistoryData(data)
    } catch (error: any) {
      console.error("Error loading price history:", error)
      toast({
        title: "Erro",
        description: error.detail || "Não foi possível carregar o histórico de preços.",
        variant: "destructive"
      })
      
      // Se o produto não está nos favoritos, redireciona
      if (error.status === 404) {
        setTimeout(() => router.push("/products/favorites"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!historyData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Histórico não disponível</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar o histórico de preços deste produto.
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

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Histórico de Preços</h1>
          <p className="text-muted-foreground">{historyData.product_name}</p>
          {historyData.product_brand && (
            <p className="text-sm text-muted-foreground">Marca: {historyData.product_brand}</p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/products/favorites">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedDays === 7 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDays(7)}
        >
          7 dias
        </Button>
        <Button
          variant={selectedDays === 30 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDays(30)}
        >
          30 dias
        </Button>
        <Button
          variant={selectedDays === 90 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDays(90)}
        >
          90 dias
        </Button>
        <Button
          variant={selectedDays === 180 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDays(180)}
        >
          6 meses
        </Button>
        <Button
          variant={selectedDays === 365 ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDays(365)}
        >
          1 ano
        </Button>
      </div>

      {/* Chart */}
      {historyData.history.length > 0 ? (
        <PriceHistoryChart
          productName={historyData.product_name}
          history={historyData.history}
          statistics={historyData.statistics}
          days={historyData.days}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum histórico disponível</h3>
            <p className="text-muted-foreground mb-4">
              Ainda não temos dados de preço para este período.
              <br />
              Continue monitorando e o histórico será construído automaticamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
