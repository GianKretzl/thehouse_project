"use client"

import { Eye, Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const products = [
  {
    id: 1,
    name: "Mercado Livre",
    sales: 284,
    revenue: "Muito Confiável",
    growth: "+23%",
    rating: 4.8,
    stock: 145,
    category: "Marketplace",
  },
  {
    id: 2,
    name: "Magazine Luiza",
    sales: 192,
    revenue: "Muito Confiável",
    growth: "+18%",
    rating: 4.6,
    stock: 67,
    category: "Eletrônicos",
  },
  {
    id: 3,
    name: "Americanas",
    sales: 145,
    revenue: "Confiável",
    growth: "+12%",
    rating: 4.9,
    stock: 234,
    category: "Varejo",
  },
  {
    id: 4,
    name: "Amazon Brasil",
    sales: 89,
    revenue: "Muito Confiável",
    growth: "+8%",
    rating: 4.7,
    stock: 12,
    category: "Marketplace",
  },
  {
    id: 5,
    name: "Casas Bahia",
    sales: 342,
    revenue: "Confiável",
    growth: "+31%",
    rating: 4.4,
    stock: 999,
    category: "Varejo",
  },
]

export function TopProducts() {
  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Sites Mais Verificados</CardTitle>
          <CardDescription>Lojas que você mais confia</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" />
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center p-3 rounded-lg border gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                #{index + 1}
              </div>
            <div className="flex gap-2 items-center justify-between space-x-3 flex-1 flex-wrap">
              <div className="">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{product.sales} verificações</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{product.revenue}</p>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 cursor-pointer"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {product.growth}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Uso: {product.stock}x</span>
                  <Progress
                    value={product.stock > 100 ? 100 : (product.stock / 100) * 100}
                    className="w-12 h-1"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
