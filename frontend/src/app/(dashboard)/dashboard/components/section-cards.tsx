"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, GraduationCap, BookOpen, ClipboardCheck, Calendar, FileText, CheckCircle2 } from "lucide-react"
import { studentsApi, teachersApi, classesApi, lessonsApi, assessmentsApi } from "@/lib/educational-api"
import { useAuth } from "@/contexts/auth-context"
import { format, startOfWeek, endOfWeek } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
  })
  const [teacherStats, setTeacherStats] = useState({
    myClasses: 0,
    pendingAttendance: 0,
    nextClassTime: "",
    weeklyContents: 0,
    pendingAssessments: 0,
    pendingClasses: [] as Array<{ classId: number; className: string; time: string }>,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "TEACHER") {
      loadTeacherStats()
    } else {
      loadStats()
    }
  }, [user?.role, user?.id])

  const loadTeacherStats = async () => {
    try {
      if (!user?.id) {
        console.log("[Dashboard] User ID não disponível")
        return
      }

      console.log("[Dashboard] Carregando stats para professor:", user.id, user.name)

      // classesApi.list() já filtra automaticamente pelo professor logado no backend
      const myClasses = await classesApi.list()
      console.log("[Dashboard] Minhas turmas:", myClasses.length, myClasses.map(c => c.name))

      // Buscar aulas de hoje para verificar frequências pendentes
      const today = format(new Date(), "yyyy-MM-dd")
      let pendingCount = 0
      let nextTime = ""
      let weeklyContentCount = 0
      let totalAssessments = 0
      const pendingClasses: Array<{ classId: number; className: string; time: string }> = []

      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
      const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")

      for (const cls of myClasses) {
        try {
          const lessons = await lessonsApi.list(cls.id)
          console.log(`[Dashboard] Turma ${cls.name}: ${lessons.length} aulas registradas`)
          
          // Contar aulas de hoje sem frequência registrada
          const todaySchedules = cls.schedules?.filter((schedule: any) => {
            const dayOfWeek = new Date().getDay()
            const scheduleDay = schedule.weekday === 6 ? 0 : schedule.weekday + 1
            return scheduleDay === dayOfWeek
          }) || []

          // Verificar se já tem aula registrada hoje
          const hasLessonToday = lessons.some(l => l.date === today)
          
          if (todaySchedules.length > 0 && !hasLessonToday) {
            pendingCount += todaySchedules.length
            
            // Adicionar turma pendente
            todaySchedules.forEach((schedule: any) => {
              const time = schedule.start_time.substring(0, 5)
              pendingClasses.push({
                classId: cls.id,
                className: cls.name,
                time: time
              })
            })
            
            // Pegar próximo horário
            if (!nextTime && todaySchedules[0]?.start_time) {
              nextTime = todaySchedules[0].start_time.substring(0, 5)
            }
          }

          // Contar conteúdos da semana
          const weeklyLessons = lessons.filter(l => 
            l.date >= weekStart && l.date <= weekEnd && l.content
          )
          weeklyContentCount += weeklyLessons.length

          // Contar avaliações
          const assessments = await assessmentsApi.list(cls.id)
          console.log(`[Dashboard] Turma ${cls.name}: ${assessments.length} avaliações`)
          totalAssessments += assessments.length
        } catch (error) {
          console.error(`Erro ao carregar dados da turma ${cls.id}:`, error)
        }
      }

      console.log("[Dashboard] Stats finais:", {
        myClasses: myClasses.length,
        pendingAttendance: pendingCount,
        nextClassTime: nextTime,
        weeklyContents: weeklyContentCount,
        pendingAssessments: totalAssessments,
        pendingClasses: pendingClasses
      })

      setTeacherStats({
        myClasses: myClasses.length,
        pendingAttendance: pendingCount,
        nextClassTime: nextTime,
        weeklyContents: weeklyContentCount,
        pendingAssessments: totalAssessments,
        pendingClasses: pendingClasses,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas do professor:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [students, teachers, classes] = await Promise.all([
        studentsApi.list(),
        teachersApi.list(),
        classesApi.list(),
      ])

      setStats({
        totalStudents: students.length,
        activeStudents: students.filter(s => s.is_active).length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        activeClasses: classes.filter(c => c.is_active).length,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cards específicos por role
  const renderDirectorCards = () => (
    <>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Alunos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.activeStudents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Users className="size-4" /> Alunos ativos
          </div>
          <div className="text-muted-foreground">
            {stats.totalStudents} alunos cadastrados no total
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Professores</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.totalTeachers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <GraduationCap className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <GraduationCap className="size-4" /> Equipe docente
          </div>
          <div className="text-muted-foreground">
            Corpo docente qualificado
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Turmas Ativas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.activeClasses}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <BookOpen className="size-4" /> Em andamento
          </div>
          <div className="text-muted-foreground">
            {stats.totalClasses} turmas cadastradas no total
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sistema Ativo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            100%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ClipboardCheck className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <ClipboardCheck className="size-4" /> Online
          </div>
          <div className="text-muted-foreground">Sistema operacional</div>
        </CardFooter>
      </Card>
    </>
  )

  const renderCoordinatorCards = () => (
    <>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Alunos Ativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.activeStudents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Users className="size-4" /> Monitoramento
          </div>
          <div className="text-muted-foreground">
            Acompanhamento pedagógico
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Turmas em Andamento</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.activeClasses}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <BookOpen className="size-4" /> Acompanhamento
          </div>
          <div className="text-muted-foreground">
            Registro de frequência e conteúdo
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Relatórios Gerados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <FileText className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <FileText className="size-4" /> Este mês
          </div>
          <div className="text-muted-foreground">
            Relatórios pedagógicos
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avaliações Pendentes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ClipboardCheck className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <ClipboardCheck className="size-4" /> Para vistar
          </div>
          <div className="text-muted-foreground">Registro de classe</div>
        </CardFooter>
      </Card>
    </>
  )

  const renderSecretaryCards = () => (
    <>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Alunos Cadastrados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.totalStudents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Users className="size-4" /> Total
          </div>
          <div className="text-muted-foreground">
            {stats.activeStudents} ativos
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Professores</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.totalTeachers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <GraduationCap className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <GraduationCap className="size-4" /> Cadastros
          </div>
          <div className="text-muted-foreground">
            Gestão docente
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Turmas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : stats.totalClasses}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <BookOpen className="size-4" /> Divisão
          </div>
          <div className="text-muted-foreground">
            {stats.activeClasses} ativas
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Eventos no Calendário</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            5
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Calendar className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Calendar className="size-4" /> Este mês
          </div>
          <div className="text-muted-foreground">Eventos cadastrados</div>
        </CardFooter>
      </Card>
    </>
  )

  const renderTeacherCards = () => {
    const handlePendingClick = () => {
      if (teacherStats.pendingClasses.length > 0) {
        const firstPending = teacherStats.pendingClasses[0]
        window.location.href = `/turmas/${firstPending.classId}?tab=chamada`
      }
    }

    return (
      <>
        <Card className="@container/card hover:shadow-lg transition-shadow cursor-pointer col-span-full md:col-span-1" onClick={() => window.location.href = '/turmas'}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="size-4 text-blue-500" />
              Minhas Turmas
            </CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums @[250px]/card:text-5xl text-blue-600 dark:text-blue-400">
              {loading ? "..." : teacherStats.myClasses}
            </CardTitle>
            <CardAction>
              <Badge variant="default" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Gerenciar →
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-semibold text-blue-700 dark:text-blue-300">
              <TrendingUp className="size-5" /> Todas ativas
            </div>
            <div className="text-muted-foreground text-base">
              Clique para gerenciar suas turmas
            </div>
          </CardFooter>
        </Card>

        <Card 
          className={`@container/card transition-all col-span-full md:col-span-1 ${
            teacherStats.pendingAttendance > 0 
              ? 'border-2 border-orange-500 shadow-xl shadow-orange-100 dark:shadow-orange-950 cursor-pointer hover:shadow-2xl' 
              : 'hover:shadow-lg border-2 border-green-500'
          }`}
          onClick={teacherStats.pendingAttendance > 0 ? handlePendingClick : undefined}
        >
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <ClipboardCheck className={`size-4 ${
                teacherStats.pendingAttendance > 0 ? 'text-orange-500 animate-pulse' : 'text-green-500'
              }`} />
              Frequências Hoje
            </CardDescription>
            <CardTitle className={`text-4xl font-bold tabular-nums @[250px]/card:text-5xl ${
              teacherStats.pendingAttendance > 0 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {loading ? "..." : teacherStats.pendingAttendance}
            </CardTitle>
            <CardAction>
              <Badge 
                variant={teacherStats.pendingAttendance > 0 ? "destructive" : "default"} 
                className={teacherStats.pendingAttendance > 0 
                  ? "bg-orange-500 animate-pulse" 
                  : "bg-green-100 text-green-700"
                }
              >
                {teacherStats.pendingAttendance > 0 ? "Pendente!" : "✓ Em dia"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            {teacherStats.pendingAttendance > 0 ? (
              <>
                <div className="flex gap-2 font-bold text-orange-700 dark:text-orange-300 text-base">
                  ⏰ Registrar frequência agora
                </div>
                <div className="space-y-1 w-full">
                  {teacherStats.pendingClasses.slice(0, 3).map((pending, idx) => (
                    <div 
                      key={idx} 
                      className="text-muted-foreground font-medium p-2 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-orange-900 dark:text-orange-200">
                          {pending.className}
                        </span>
                        <span className="text-orange-700 dark:text-orange-300 font-bold">
                          {pending.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  {teacherStats.pendingClasses.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{teacherStats.pendingClasses.length - 3} mais
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground italic pt-1">
                  Clique no card para registrar
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2 font-semibold text-green-700 dark:text-green-300 text-base">
                  <CheckCircle2 className="size-5" /> Tudo registrado!
                </div>
                <div className="text-muted-foreground text-base">
                  {teacherStats.nextClassTime 
                    ? `Próxima aula às ${teacherStats.nextClassTime}` 
                    : "Sem aulas agendadas hoje"
                  }
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </>
    )
  }

  const renderCards = () => {
    switch (user?.role) {
      case "DIRECTOR":
        return renderDirectorCards()
      case "COORDINATOR":
        return renderCoordinatorCards()
      case "SECRETARY":
        return renderSecretaryCards()
      case "TEACHER":
        return renderTeacherCards()
      default:
        return renderDirectorCards()
    }
  }

  return (
    <div className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 ${
      user?.role === "TEACHER" ? "grid-cols-1 md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"
    }`}>
      {renderCards()}
    </div>
  )
}
