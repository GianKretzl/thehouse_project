import { UserPlus, BookOpen, Users, FileText, Calendar } from "lucide-react"
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
    type: "student",
    title: "Novo aluno cadastrado",
    description: "Ana Carolina Silva - 5º Ano A",
    time: "Há 2 horas",
    icon: UserPlus,
    variant: "default" as const,
  },
  {
    id: 2,
    type: "class",
    title: "Turma criada",
    description: "6º Ano B - Matemática Avançada",
    time: "Há 5 horas",
    icon: Users,
    variant: "default" as const,
  },
  {
    id: 3,
    type: "lesson",
    title: "Aula registrada",
    description: "Português - Literatura Brasileira",
    time: "Ontem",
    icon: BookOpen,
    variant: "secondary" as const,
  },
  {
    id: 4,
    type: "assessment",
    title: "Avaliação lançada",
    description: "Prova de História - 7º Ano",
    time: "Ontem",
    icon: FileText,
    variant: "secondary" as const,
  },
  {
    id: 5,
    type: "event",
    title: "Evento agendado",
    description: "Reunião de Pais - 15/12",
    time: "Há 2 dias",
    icon: Calendar,
    variant: "outline" as const,
  },
]

export function RecentActivity() {
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
          {recentActivities.map((activity) => {
            const Icon = activity.icon
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
                    <Badge variant={activity.variant} className="ml-auto text-xs">
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
