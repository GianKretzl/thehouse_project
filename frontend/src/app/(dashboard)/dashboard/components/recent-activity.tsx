"use client"

import { UserPlus, BookOpen, Users, FileText, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const iconMap = {
  UserPlus: UserPlus,
  BookOpen: BookOpen,
  Users: Users,
  FileText: FileText,
  Calendar: Calendar,
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: keyof typeof iconMap
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    async function fetchActivities() {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setLoading(false)
          return
        }
        
        const response = await fetch(`${API_URL}/api/v1/activities/recent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok && isMounted) {
          const data = await response.json()
          setActivities(data)
        }
      } catch (error) {
        console.error('Erro ao buscar atividades:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Delay para não bloquear renderização inicial
    const timeoutId = setTimeout(fetchActivities, 100)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  const getVariant = (time: string) => {
    if (time.includes('hora') || time.includes('minuto')) return 'default'
    if (time === 'Ontem') return 'secondary'
    return 'outline'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Carregando...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>
          Últimas atualizações e registros do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.icon] || UserPlus
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="rounded-full p-2 bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <Badge variant={getVariant(activity.time)} className="ml-auto text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
