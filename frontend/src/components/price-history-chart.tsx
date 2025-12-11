"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

interface PricePoint {
  price: number
  store_name: string
  recorded_at: string
  discount?: number
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

interface PriceHistoryChartProps {
  productName: string
  history: PricePoint[]
  statistics: PriceStatistics
  days: number
}

export function PriceHistoryChart({ 
  productName, 
  history, 
  statistics,
  days 
}: PriceHistoryChartProps) {
  // Prepara dados para o gráfico (ordem cronológica)
  const chartData = [...history].reverse().map((point, index) => ({
    date: new Date(point.recorded_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    }),
    price: point.price,
    store: point.store_name,
    fullDate: new Date(point.recorded_at).toLocaleString("pt-BR"),
    index
  }))

  // Cor da linha baseada na tendência
  const lineColor = statistics.price_trend === "down" ? "#10b981" : 
                    statistics.price_trend === "up" ? "#ef4444" : 
                    "#6366f1"

  const TrendIcon = statistics.price_trend === "down" ? TrendingDown :
                    statistics.price_trend === "up" ? TrendingUp :
                    Minus

  const trendText = statistics.price_trend === "down" ? "Em queda" :
                    statistics.price_trend === "up" ? "Em alta" :
                    "Estável"

  const trendColor = statistics.price_trend === "down" ? "text-green-600" :
                     statistics.price_trend === "up" ? "text-red-600" :
                     "text-blue-600"

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">R$ {data.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">{data.store}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.fullDate}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg mb-2">
              Histórico de Preços - {days} dias
            </CardTitle>
            <p className="text-sm text-muted-foreground">{productName}</p>
          </div>
          <Badge variant="outline" className={trendColor}>
            <TrendIcon className="h-4 w-4 mr-1" />
            {trendText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Menor Preço</p>
            <p className="text-lg font-bold text-green-600">
              R$ {statistics.lowest_price.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Maior Preço</p>
            <p className="text-lg font-bold text-red-600">
              R$ {statistics.highest_price.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Preço Médio</p>
            <p className="text-lg font-bold text-blue-600">
              R$ {statistics.average_price.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Atual</p>
            <p className="text-lg font-bold text-purple-600">
              R$ {statistics.current_price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm">
                <strong>Variação:</strong> R$ {statistics.volatility.toFixed(2)} (
                {((statistics.volatility / statistics.average_price) * 100).toFixed(1)}%)
              </p>
              <p className="text-sm mt-1">
                <strong>Pontos de dados:</strong> {statistics.data_points} verificações
              </p>
              {statistics.current_price === statistics.lowest_price && (
                <p className="text-sm mt-2 text-green-600 font-semibold">
                  💰 Este é o menor preço registrado! Excelente oportunidade de compra.
                </p>
              )}
              {statistics.current_price === statistics.highest_price && (
                <p className="text-sm mt-2 text-red-600 font-semibold">
                  ⚠️ Este é o maior preço registrado. Considere aguardar uma queda.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Linha de preço médio */}
              <ReferenceLine 
                y={statistics.average_price} 
                stroke="#6366f1" 
                strokeDasharray="5 5"
                label={{ value: 'Média', position: 'right', fill: '#6366f1' }}
              />
              
              {/* Linha de menor preço */}
              <ReferenceLine 
                y={statistics.lowest_price} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                label={{ value: 'Menor', position: 'right', fill: '#10b981' }}
              />
              
              {/* Linha principal */}
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={lineColor}
                strokeWidth={3}
                dot={{ fill: lineColor, r: 4 }}
                activeDot={{ r: 6 }}
                name="Preço (R$)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Melhor momento para comprar */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
            💡 Dica de Compra
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            {statistics.current_price <= statistics.average_price * 0.95 ? (
              <>
                <strong>Excelente momento para comprar!</strong> O preço atual está 
                {' '}{(((statistics.average_price - statistics.current_price) / statistics.average_price) * 100).toFixed(1)}% 
                abaixo da média.
              </>
            ) : statistics.current_price <= statistics.average_price ? (
              <>
                <strong>Bom momento para comprar.</strong> O preço está próximo ou abaixo da média histórica.
              </>
            ) : (
              <>
                <strong>Considere aguardar.</strong> O preço atual está 
                {' '}{(((statistics.current_price - statistics.average_price) / statistics.average_price) * 100).toFixed(1)}%
                {' '}acima da média. Crie um alerta de preço para ser notificado quando o valor cair.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
