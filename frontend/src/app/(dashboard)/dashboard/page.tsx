"use client"

import { useAuth } from "@/contexts/auth-context"
import { Suspense, lazy } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load componentes pesados
const ChartAreaInteractive = lazy(() => import("./components/chart-area-interactive").then(m => ({ default: m.ChartAreaInteractive })))
const SectionCards = lazy(() => import("./components/section-cards").then(m => ({ default: m.SectionCards })))
const RecentActivity = lazy(() => import("./components/recent-activity").then(m => ({ default: m.RecentActivity })))

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
        <Suspense fallback={<CardsSkeleton />}>
          <SectionCards />
        </Suspense>
        
        {(user?.role === "DIRECTOR" || user?.role === "SECRETARY" || user?.role === "PEDAGOGUE") && (
          <Suspense fallback={<ChartSkeleton />}>
            <ChartAreaInteractive />
          </Suspense>
        )}
        
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </>
  )
}

// Loading Skeletons
function CardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return <Skeleton className="h-[400px] w-full" />
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  )
}
