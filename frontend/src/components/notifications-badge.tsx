"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function NotificationsBadge() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications()
  
  // Pega apenas as 5 mais recentes
  const recentNotifications = notifications.slice(0, 5)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return '🚨'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    // Marca como lida se não foi lida
    if (!notification.read) {
      await markAsRead([notification.id])
    }
    
    // Se a notificação tem URL, redireciona para verificação
    if (notification.url) {
      router.push(`/dashboard/verify?url=${encodeURIComponent(notification.url)}`)
    }
  }

  const viewAllNotifications = () => {
    router.push('/dashboard/notifications')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            Notificações {unreadCount > 0 && `(${unreadCount} não lidas)`}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} nova{unreadCount !== 1 && 's'}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 cursor-pointer p-3",
                  !notification.read && "bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start gap-2">
                  <span className="text-lg">
                    {getSeverityIcon(notification.severity)}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm font-medium leading-none",
                      getSeverityColor(notification.severity)
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full text-center cursor-pointer"
          onClick={viewAllNotifications}
        >
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
