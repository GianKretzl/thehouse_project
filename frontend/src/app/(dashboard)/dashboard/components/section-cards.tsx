"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, GraduationCap, BookOpen, ClipboardCheck, Calendar, FileText } from "lucide-react"
import { studentsApi, teachersApi, classesApi } from "@/lib/educational-api"
import { useAuth } from "@/contexts/auth-context"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Professores não precisam carregar stats globais
    if (user?.role !== "TEACHER") {
      loadStats()
    } else {
      setLoading(false)
    }
  }, [user?.role])

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

  const renderPedagogueCards = () => (
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

  const renderTeacherCards = () => (
    <>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Minhas Turmas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <BookOpen className="size-4" /> Ativas
          </div>
          <div className="text-muted-foreground">
            Turmas sob sua responsabilidade
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Chamadas Hoje</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ClipboardCheck className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <ClipboardCheck className="size-4" /> Pendentes
          </div>
          <div className="text-muted-foreground">
            Próxima chamada: 14:00
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Conteúdo Aplicado</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <BookOpen className="size-4" /> Esta semana
          </div>
          <div className="text-muted-foreground">
            Conteúdos registrados
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Notas Pendentes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <FileText className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <FileText className="size-4" /> Para lançar
          </div>
          <div className="text-muted-foreground">Avaliações aguardando</div>
        </CardFooter>
      </Card>
    </>
  )

  const renderCards = () => {
    switch (user?.role) {
      case "DIRECTOR":
        return renderDirectorCards()
      case "PEDAGOGUE":
        return renderPedagogueCards()
      case "SECRETARY":
        return renderSecretaryCards()
      case "TEACHER":
        return renderTeacherCards()
      default:
        return renderDirectorCards()
    }
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {renderCards()}
    </div>
  )
}
