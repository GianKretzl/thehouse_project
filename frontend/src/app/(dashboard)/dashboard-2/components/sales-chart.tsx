"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const salesData = [
  { month: "Jan", sales: 125, target: 150 },
  { month: "Fev", sales: 182, target: 150 },
  { month: "Mar", sales: 168, target: 150 },
  { month: "Abr", sales: 224, target: 200 },
  { month: "Mai", sales: 246, target: 200 },
  { month: "Jun", sales: 282, target: 250 },
  { month: "Jul", sales: 315, target: 250 },
  { month: "Ago", sales: 298, target: 250 },
  { month: "Set", sales: 332, target: 300 },
  { month: "Out", sales: 351, target: 300 },
  { month: "Nov", sales: 389, target: 350 },
  { month: "Dez", sales: 423, target: 350 },
]

const chartConfig = {
  sales: {
    label: "Verificações",
    color: "var(--primary)",
  },
  target: {
    label: "Meta",
    color: "var(--primary)",
  },
}

export function SalesChart() {
  const [timeRange, setTimeRange] = useState("12m")

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Verificações ao Longo do Tempo</CardTitle>
          <CardDescription>Links verificados mensalmente</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m" className="cursor-pointer">Últimos 3 meses</SelectItem>
              <SelectItem value="6m" className="cursor-pointer">Últimos 6 meses</SelectItem>
              <SelectItem value="12m" className="cursor-pointer">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer">
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-target)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-target)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="target"
                stackId="1"
                stroke="var(--color-target)"
                fill="url(#colorTarget)"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stackId="2"
                stroke="var(--color-sales)"
                fill="url(#colorSales)"
                strokeWidth={1}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
