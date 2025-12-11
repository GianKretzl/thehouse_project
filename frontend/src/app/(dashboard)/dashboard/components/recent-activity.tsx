import { Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recentActivities = [
  {
    id: 1,
    type: "safe",
    site: "magazineluiza.com.br",
    action: "Link verificado",
    time: "Há 2 horas",
    icon: CheckCircle,
    variant: "default" as const,
  },
  {
    id: 2,
    type: "safe",
    site: "mercadolivre.com.br",
    action: "Site adicionado aos confiáveis",
    time: "Há 5 horas",
    icon: Shield,
    variant: "default" as const,
  },
  {
    id: 3,
    type: "warning",
    site: "oferta-imperdivel-xyz.com",
    action: "Ameaça bloqueada",
    time: "Ontem",
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
  {
    id: 4,
    type: "safe",
    site: "americanas.com.br",
    action: "Link verificado",
    time: "Ontem",
    icon: CheckCircle,
    variant: "default" as const,
  },
  {
    id: 5,
    type: "safe",
    site: "submarino.com.br",
    action: "Link verificado",
    time: "Há 2 dias",
    icon: CheckCircle,
    variant: "default" as const,
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>
          Suas últimas verificações e ações de segurança
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className={`rounded-full p-2 ${
                  activity.type === "safe" 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : "bg-red-100 dark:bg-red-900/20"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    activity.type === "safe" 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.site}
                    </p>
                    <Badge variant={activity.variant} className="ml-auto">
                      {activity.type === "safe" ? "Seguro" : "Bloqueado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
