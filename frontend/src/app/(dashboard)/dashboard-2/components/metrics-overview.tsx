"use client"

import { 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Award 
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const metrics = [
  {
    title: "Links Verificados Hoje",
    value: "127",
    description: "Verificações diárias",
    change: "+12%",
    trend: "up",
    icon: Shield,
    footer: "Você está mais protegido!",
    subfooter: "Verificações nos últimos 30 dias"
  },
  {
    title: "Sites na Lista Segura",
    value: "45",
    description: "Total de sites confiáveis",
    change: "+5", 
    trend: "up",
    icon: CheckCircle,
    footer: "Sua lista está crescendo",
    subfooter: "Lojas verificadas por você"
  },
  {
    title: "Ameaças Bloqueadas",
    value: "23",
    description: "Golpes evitados este mês",
    change: "+15%",
    trend: "up", 
    icon: AlertTriangle,
    footer: "Excelente proteção!",
    subfooter: "Você evitou prejuízos"
  },
  {
    title: "Nível de Segurança",
    value: "95%",
    description: "Índice de proteção",
    change: "+3%",
    trend: "up",
    icon: Award,
    footer: "Proteção excepcional",
    subfooter: "Você está muito bem protegido"
  },
]

export function MetricsOverview() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        
        return (
          <Card key={metric.title} className=" cursor-pointer">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendingUp className="h-4 w-4" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <Icon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
