"use client"

import { useState } from "react"
import { Bell, Trash2, CheckCheck, Filter, AlertTriangle, Shield, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useNotifications } from "@/hooks/use-notifications"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Notification } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const router = useRouter()

  const filteredNotifications = notifications.filter((notification) => {
    // Filtro de leitura
    if (filter === "unread" && notification.read) return false
    if (filter === "read" && !notification.read) return false

    // Filtro de severidade
    if (severityFilter && notification.severity !== severityFilter) return false

    return true
  })

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead([notificationId])
      toast.success("Notificação marcada como lida")
    } catch (error) {
      toast.error("Erro ao marcar notificação como lida")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success("Todas as notificações marcadas como lidas")
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas")
    }
  }

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId)
      toast.success("Notificação excluída")
    } catch (error) {
      toast.error("Erro ao excluir notificação")
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.url) {
      router.push(`/dashboard/verify?url=${encodeURIComponent(notification.url)}`)
    }
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Shield className="h-4 w-4 text-green-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "danger":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      default:
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "danger":
        return "bg-red-600 hover:bg-red-700"
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "info":
        return "bg-blue-600 hover:bg-blue-700"
      default:
        return "bg-green-600 hover:bg-green-700"
    }
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "danger_url":
        return "🚨"
      case "phishing":
        return "🎣"
      case "limit_warning":
        return "⚠️"
      case "limit_reached":
        return "🛑"
      case "subscription_changed":
        return "💳"
      case "subscription_expired":
        return "⏰"
      default:
        return "📢"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex-1 space-y-6 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          Acompanhe seus alertas de segurança e atualizações importantes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Não lidas ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read">Lidas ({notifications.length - unreadCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button
            variant={severityFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSeverityFilter(null)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Todas
          </Button>
          <Button
            variant={severityFilter === "danger" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setSeverityFilter(severityFilter === "danger" ? null : "danger")}
          >
            Perigo
          </Button>
          <Button
            variant={severityFilter === "warning" ? "default" : "outline"}
            size="sm"
            onClick={() => setSeverityFilter(severityFilter === "warning" ? null : "warning")}
            className={severityFilter === "warning" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
          >
            Atenção
          </Button>
          <Button
            variant={severityFilter === "info" ? "default" : "outline"}
            size="sm"
            onClick={() => setSeverityFilter(severityFilter === "info" ? null : "info")}
            className={severityFilter === "info" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Info
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))
        ) : filteredNotifications.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-sm text-muted-foreground text-center">
                {filter === "unread" 
                  ? "Você não tem notificações não lidas"
                  : filter === "read"
                  ? "Você não tem notificações lidas"
                  : severityFilter
                  ? "Nenhuma notificação corresponde aos filtros selecionados"
                  : "Você receberá notificações importantes aqui"}
              </p>
            </CardContent>
          </Card>
        ) : (
          // Notifications
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`${getSeverityColor(notification.severity)} ${
                !notification.read ? "border-l-4" : ""
              } transition-all hover:shadow-md cursor-pointer`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl mt-1">{getTypeEmoji(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {notification.message}
                      </CardDescription>
                      {notification.url && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          🔗 {notification.url}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${getSeverityBadgeColor(notification.severity)} text-white text-xs`}>
                      {notification.severity === "danger" ? "PERIGO" : 
                       notification.severity === "warning" ? "ATENÇÃO" : 
                       notification.severity === "info" ? "INFO" : "SEGURO"}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {getSeverityIcon(notification.severity)}
                    <span>
                      {notification.sent_email && "📧 Email enviado"}
                      {notification.sent_email && notification.sent_whatsapp && " • "}
                      {notification.sent_whatsapp && "📱 WhatsApp enviado"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={handleDialogClick}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir notificação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A notificação será permanentemente excluída.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(notification.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
