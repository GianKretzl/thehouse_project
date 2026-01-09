"use client"

import { UserPlus, BookOpen, Users, FileText, Calendar, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { classesApi, lessonsApi, assessmentsApi } from "@/lib/educational-api"
import { useAuth } from "@/contexts/auth-context"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const iconMap = {
  UserPlus: UserPlus,
  BookOpen: BookOpen,
  Users: Users,
  FileText: FileText,
  Calendar: Calendar,
  CheckCircle2: CheckCircle2,
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: keyof typeof iconMap
  date: Date
}

export function RecentActivity() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "TEACHER") {
      loadTeacherActivities()
    } else {
      setLoading(false)
    }
  }, [user?.role, user?.id])

  const loadTeacherActivities = async () => {
    try {
      if (!user?.id) {
        console.log("[Atividades] User ID não disponível")
        return
      }

      console.log("[Atividades] Carregando para professor:", user.id, user.name)

      const allActivities: Activity[] = []

      // classesApi.list() já filtra automaticamente pelo professor logado no backend
      const myClasses = await classesApi.list()
      console.log("[Atividades] Minhas turmas:", myClasses.length)

      for (const cls of myClasses) {
        try {
          // Buscar aulas recentes (últimas 10)
          const lessons = await lessonsApi.list(cls.id)
          console.log(`[Atividades] Turma ${cls.name}: ${lessons.length} aulas`)
          
          const recentLessons = lessons
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)

          // Adicionar frequências
          for (const lesson of recentLessons) {
            const lessonDate = new Date(lesson.date + "T12:00:00")
            allActivities.push({
              id: `lesson-${lesson.id}`,
              type: "attendance",
              title: "Frequência registrada",
              description: `${cls.name} - ${format(lessonDate, "dd/MM/yyyy", { locale: ptBR })}`,
              time: formatDistanceToNow(lessonDate, { addSuffix: true, locale: ptBR }),
              icon: "CheckCircle2",
              date: lessonDate,
            })

            // Se tem conteúdo, adicionar atividade de conteúdo
            if (lesson.content) {
              allActivities.push({
                id: `content-${lesson.id}`,
                type: "content",
                title: "Conteúdo registrado",
                description: `${cls.name} - ${lesson.content.substring(0, 50)}${lesson.content.length > 50 ? "..." : ""}`,
                time: formatDistanceToNow(lessonDate, { addSuffix: true, locale: ptBR }),
                icon: "BookOpen",
                date: lessonDate,
              })
            }
          }

          // Buscar avaliações recentes
          const assessments = await assessmentsApi.list(cls.id)
          console.log(`[Atividades] Turma ${cls.name}: ${assessments.length} avaliações`)
          
          const recentAssessments = assessments
            .sort((a, b) => new Date(b.created_at || b.assessment_date).getTime() - new Date(a.created_at || a.assessment_date).getTime())
            .slice(0, 5)

          for (const assessment of recentAssessments) {
            const assessmentDate = new Date(assessment.created_at || assessment.assessment_date)
            allActivities.push({
              id: `assessment-${assessment.id}`,
              type: "assessment",
              title: "Avaliação lançada",
              description: `${cls.name} - ${assessment.type}`,
              time: formatDistanceToNow(assessmentDate, { addSuffix: true, locale: ptBR }),
              icon: "FileText",
              date: assessmentDate,
            })
          }
        } catch (error) {
          console.error(`Erro ao carregar atividades da turma ${cls.id}:`, error)
        }
      }

      // Ordenar por data mais recente e pegar últimas 7
      const sortedActivities = allActivities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 7)

      console.log("[Atividades] Total de atividades:", sortedActivities.length)
      setActivities(sortedActivities)
    } catch (error) {
      console.error("Erro ao carregar atividades:", error)
    } finally {
      setLoading(false)
    }
  }

  const getVariant = (time: string) => {
    if (time.includes('hora') || time.includes('minuto')) return 'default'
    if (time.includes('ontem')) return 'secondary'
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

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Últimas atualizações e registros do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade registrada ainda</p>
          </div>
        </CardContent>
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
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
