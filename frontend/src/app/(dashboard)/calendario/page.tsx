"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize eventos e datas importantes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário Escolar</CardTitle>
          <CardDescription>
            Datas de aulas, avaliações e eventos institucionais
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarIcon className="h-24 w-24 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em desenvolvimento</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            O calendário interativo estará disponível em breve. Você poderá visualizar
            e gerenciar todas as datas importantes da instituição.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
