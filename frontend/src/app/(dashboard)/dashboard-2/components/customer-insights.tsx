"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, MapPin, TrendingUp, Target, ArrowUpIcon, UserIcon } from "lucide-react"

const customerGrowthData = [
  { month: "Jan", new: 24, returning: 89, churn: 4 },
  { month: "Fev", new: 31, returning: 93, churn: 5 },
  { month: "Mar", new: 28, returning: 102, churn: 3 },
  { month: "Abr", new: 45, returning: 115, churn: 6 },
  { month: "Mai", new: 52, returning: 129, churn: 4 },
  { month: "Jun", new: 63, returning: 144, churn: 5 },
]

const chartConfig = {
  new: {
    label: "Novos Links",
    color: "var(--chart-1)",
  },
  returning: {
    label: "Links Revisitados",
    color: "var(--chart-2)",
  },
  churn: {
    label: "Bloqueados",
    color: "var(--chart-3)",
  },
}

const demographicsData = [
  { ageGroup: "18-24", customers: 28, percentage: "18.0%", growth: "+15.2%", growthColor: "text-green-600" },
  { ageGroup: "25-34", customers: 45, percentage: "28.5%", growth: "+8.7%", growthColor: "text-green-600" },
  { ageGroup: "35-44", customers: 39, percentage: "25.1%", growth: "+3.4%", growthColor: "text-blue-600" },
  { ageGroup: "45-54", customers: 27, percentage: "17.2%", growth: "+1.2%", growthColor: "text-orange-600" },
  { ageGroup: "55+", customers: 17, percentage: "11.2%", growth: "+2.1%", growthColor: "text-green-600" },
]

const regionsData = [
  { region: "Sudeste", customers: 68, revenue: "45 sites", growth: "+12.3%", growthColor: "text-green-600" },
  { region: "Sul", customers: 45, revenue: "32 sites", growth: "+9.7%", growthColor: "text-green-600" },
  { region: "Nordeste", customers: 28, revenue: "21 sites", growth: "+18.4%", growthColor: "text-blue-600" },
  { region: "Centro-Oeste", customers: 11, revenue: "8 sites", growth: "+15.8%", growthColor: "text-green-600" },
  { region: "Norte", customers: 4, revenue: "3 sites", growth: "+5.2%", growthColor: "text-orange-600" },
]

export function CustomerInsights() {
  const [activeTab, setActiveTab] = useState("growth")

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Estatísticas de Uso</CardTitle>
        <CardDescription>Tendências e padrões de verificação</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg h-12">
            <TabsTrigger
              value="growth"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Crescimento</span>
            </TabsTrigger>
            <TabsTrigger
              value="demographics"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Faixa Etária</span>
            </TabsTrigger>
            <TabsTrigger
              value="regions"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Regiões</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="mt-8 space-y-6">
            <div className="grid gap-6">
              {/* Chart and Key Metrics Side by Side */}
              <div className="grid grid-cols-10 gap-6">
                {/* Chart Area - 70% */}
                <div className="col-span-10 xl:col-span-7">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">Tendências de Verificação</h3>
                  <ChartContainer config={chartConfig} className="h-[375px] w-full">
                    <BarChart data={customerGrowthData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'var(--border)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'var(--border)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                        domain={[0, 'dataMax']}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="new" fill="var(--color-new)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="returning" fill="var(--color-returning)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="churn" fill="var(--color-churn)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>

                {/* Key Metrics - 30% */}
                <div className="col-span-10 xl:col-span-3 space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">Principais Métricas</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Total de Links</span>
                      </div>
                      <div className="text-2xl font-bold">158</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUpIcon className="h-3 w-3" />
                        +12,5% do mês passado
                      </div>
                    </div>

                    <div className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Taxa de Proteção</span>
                      </div>
                      <div className="text-2xl font-bold">92,4%</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUpIcon className="h-3 w-3" />
                        +2,1% de melhoria
                      </div>
                    </div>

                    <div className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Média Diária</span>
                      </div>
                      <div className="text-2xl font-bold">28</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUpIcon className="h-3 w-3" />
                        +8,3% de crescimento
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="mt-8">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="py-5 px-6 font-semibold">Faixa Etária</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Usuários</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Percentual</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Crescimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demographicsData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-5 px-6">{row.ageGroup}</TableCell>
                      <TableCell className="text-right py-5 px-6">{row.customers.toLocaleString()}</TableCell>
                      <TableCell className="text-right py-5 px-6">{row.percentage}</TableCell>
                      <TableCell className="text-right py-5 px-6">
                        <span className={`font-medium ${row.growthColor}`}>{row.growth}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-6">
              <div className="text-muted-foreground text-sm hidden sm:block">
                0 de {demographicsData.length} linha(s) selecionada(s).
              </div>
              <div className="space-x-2 space-y-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Próximo
                </Button>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="regions" className="mt-8">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="py-5 px-6 font-semibold">Região</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Usuários</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Sites Verificados</TableHead>
                    <TableHead className="text-right py-5 px-6 font-semibold">Crescimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionsData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-5 px-6">{row.region}</TableCell>
                      <TableCell className="text-right py-5 px-6">{row.customers.toLocaleString()}</TableCell>
                      <TableCell className="text-right py-5 px-6">{row.revenue}</TableCell>
                      <TableCell className="text-right py-5 px-6">
                        <span className={`font-medium ${row.growthColor}`}>{row.growth}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-6">
              <div className="text-muted-foreground text-sm hidden sm:block">
                0 de {regionsData.length} linha(s) selecionada(s).
              </div>
              <div className="space-x-2 space-y-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Próximo
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
