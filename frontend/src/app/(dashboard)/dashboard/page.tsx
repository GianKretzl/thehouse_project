"use client"

import { useAuth } from "@/contexts/auth-context"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { SectionCards } from "./components/section-cards"
import { RecentActivity } from "./components/recent-activity"

export default function Page() {
  const { user } = useAuth()

  const getDashboardTitle = () => {
    switch (user?.role) {
      case "DIRECTOR":
        return "Dashboard - Diretor(a)"
      case "PEDAGOGUE":
        return "Dashboard - Pedagogo(a)"
      case "SECRETARY":
        return "Dashboard - Secretário(a)"
      case "TEACHER":
        return "Dashboard - Professor(a)"
      default:
        return "Dashboard Acadêmico"
    }
  }

  const getDashboardDescription = () => {
    switch (user?.role) {
      case "DIRECTOR":
        return "Visão geral completa da instituição"
      case "PEDAGOGUE":
        return "Acompanhamento pedagógico e desempenho dos alunos"
      case "SECRETARY":
        return "Gestão administrativa e cadastros"
      case "TEACHER":
        return "Suas turmas e atividades do dia"
      default:
        return "Bem-vindo ao sistema The House Platform"
    }
  }

  return (
    <>
      {/* Page Title and Description */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{getDashboardTitle()}</h1>
          <p className="text-muted-foreground">{getDashboardDescription()}</p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        {(user?.role === "DIRECTOR" || user?.role === "SECRETARY" || user?.role === "PEDAGOGUE") && (
          <ChartAreaInteractive />
        )}
        <RecentActivity />
      </div>
    </>
  )
}
