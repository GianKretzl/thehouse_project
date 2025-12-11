"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  BellRing,
  Trash2, 
  Edit,
  TrendingDown,
  TrendingUp,
  Target,
  Check,
  X
} from "lucide-react"
import { productsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PriceAlert {
  id: number
  favorite_product_id: number
  target_price: number
  alert_type: "below" | "above" | "exact"
  is_active: boolean
  is_triggered: boolean
  triggered_at?: string
  triggered_price?: number
  notification_sent: boolean
  notification_channels?: string[]
  created_at: string
  favorite_product?: {
    product_name: string
    product_image?: string
    product_brand?: string
    current_price?: number
    initial_price: number
  }
}

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [stats, setStats] = useState<{ total: number; active_count: number; triggered_count: number }>({
    total: 0,
    active_count: 0,
    triggered_count: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<PriceAlert | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getPriceAlerts()
      setAlerts(response.items)
      setStats({
        total: response.total,
        active_count: response.active_count,
        triggered_count: response.triggered_count
      })
    } catch (error: any) {
      console.error("Error loading alerts:", error)
      toast({
        title: "Erro ao carregar alertas",
        description: error.detail || "Não foi possível carregar seus alertas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlert = async (alert: PriceAlert) => {
    try {
      await productsApi.deletePriceAlert(alert.id)
      setAlerts(alerts.filter(a => a.id !== alert.id))
      setDeleteDialogOpen(false)
      toast({
        title: "Alerta removido",
        description: "O alerta de preço foi removido com sucesso.",
      })
      loadAlerts() // Reload to update stats
    } catch (error: any) {
      console.error("Error deleting alert:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o alerta.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (alert: PriceAlert) => {
    try {
      await productsApi.updatePriceAlert(alert.id, {
        is_active: !alert.is_active
      })
      
      setAlerts(alerts.map(a => 
        a.id === alert.id 
          ? { ...a, is_active: !a.is_active }
          : a
      ))
      
      toast({
        title: alert.is_active ? "Alerta pausado" : "Alerta ativado",
        description: alert.is_active 
          ? "O alerta foi pausado e não enviará notificações." 
          : "O alerta foi ativado e enviará notificações.",
      })
      loadAlerts() // Reload to update stats
    } catch (error: any) {
      console.error("Error toggling alert:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o alerta.",
        variant: "destructive",
      })
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "below":
        return <TrendingDown className="h-4 w-4" />
      case "above":
        return <TrendingUp className="h-4 w-4" />
      case "exact":
        return <Target className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case "below":
        return "Abaixo de"
      case "above":
        return "Acima de"
      case "exact":
        return "Igual a"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando alertas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Alertas de Preço
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus alertas de preço e seja notificado automaticamente
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              alertas cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <BellRing className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_count}</div>
            <p className="text-xs text-muted-foreground">
              monitorando preços
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Disparados</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.triggered_count}</div>
            <p className="text-xs text-muted-foreground">
              objetivos atingidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      {alerts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum alerta criado</h3>
            <p className="text-muted-foreground mb-6">
              Crie alertas para seus produtos favoritos e seja notificado quando o preço atingir seu objetivo!
            </p>
            <Button onClick={() => window.location.href = "/products/favorites"}>
              Ver Meus Favoritos
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`${
                alert.is_triggered 
                  ? "border-green-500 bg-green-50/50 dark:bg-green-950/10" 
                  : alert.is_active 
                    ? "border-blue-500/30" 
                    : "opacity-60"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Produto */}
                    <div>
                      <h3 className="font-semibold line-clamp-2">
                        {alert.favorite_product?.product_name || "Produto"}
                      </h3>
                      {alert.favorite_product?.product_brand && (
                        <p className="text-sm text-muted-foreground">
                          {alert.favorite_product.product_brand}
                        </p>
                      )}
                    </div>

                    {/* Detalhes do Alerta */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {getAlertTypeIcon(alert.alert_type)}
                        <span className="font-medium">{getAlertTypeText(alert.alert_type)}</span>
                        <span className="font-bold text-primary">
                          R$ {alert.target_price.toFixed(2)}
                        </span>
                      </div>

                      {alert.favorite_product?.current_price && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <div>
                            <span className="text-muted-foreground">Preço atual: </span>
                            <span className="font-medium">
                              R$ {alert.favorite_product.current_price.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {alert.is_triggered ? (
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Alerta Disparado
                        </Badge>
                      ) : alert.is_active ? (
                        <Badge className="bg-blue-500">
                          <BellRing className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="h-3 w-3 mr-1" />
                          Pausado
                        </Badge>
                      )}

                      {alert.notification_channels && alert.notification_channels.length > 0 && (
                        <Badge variant="outline">
                          {alert.notification_channels.join(", ")}
                        </Badge>
                      )}
                    </div>

                    {/* Data de disparo */}
                    {alert.is_triggered && alert.triggered_at && (
                      <p className="text-xs text-muted-foreground">
                        Disparado em {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                        {alert.triggered_price && (
                          <> por R$ {alert.triggered_price.toFixed(2)}</>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {!alert.is_triggered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(alert)}
                      >
                        {alert.is_active ? (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAlert(alert)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover alerta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este alerta de preço?
              Você não receberá mais notificações para este produto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAlert && handleDeleteAlert(selectedAlert)}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
