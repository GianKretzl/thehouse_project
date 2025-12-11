"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  ClipboardList,
  Settings,
  UserCircle,
  HelpCircle,
  FileText,
  School,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from '@/contexts/auth-context'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Função para filtrar navegação baseada no role do usuário
function getNavGroups(userRole?: string) {
  const isDirector = userRole === "DIRECTOR"
  const isPedagogue = userRole === "PEDAGOGUE"
  const isSecretary = userRole === "SECRETARY"
  const isTeacher = userRole === "TEACHER"

  // Diretor tem acesso total
  const hasFullAccess = isDirector
  // Secretário tem acesso administrativo
  const hasAdminAccess = isDirector || isSecretary
  // Pedagogo tem acesso pedagógico
  const hasPedagogicalAccess = isDirector || isPedagogue || isSecretary
  // Professor tem acesso básico
  const hasTeacherAccess = isTeacher || hasFullAccess || hasPedagogicalAccess

  const navGroups = []

  // Principal - todos têm acesso
  navGroups.push({
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Calendário",
        url: "/calendar",
        icon: Calendar,
      },
    ],
  })

  // Gestão Acadêmica
  const academicItems = []
  
  if (hasAdminAccess || hasPedagogicalAccess) {
    academicItems.push({
      title: "Alunos",
      url: "/alunos",
      icon: Users,
    })
  }

  if (hasAdminAccess || hasPedagogicalAccess) {
    academicItems.push({
      title: "Professores",
      url: "/professores",
      icon: GraduationCap,
    })
  }

  if (hasAdminAccess || hasPedagogicalAccess) {
    academicItems.push({
      title: "Turmas",
      url: "/turmas",
      icon: School,
    })
  }

  if (hasTeacherAccess) {
    academicItems.push({
      title: "Aulas",
      url: "/aulas",
      icon: BookOpen,
    })
  }

  if (academicItems.length > 0) {
    navGroups.push({
      label: "Gestão Acadêmica",
      items: academicItems,
    })
  }

  // Avaliações
  const evaluationItems = []

  if (hasTeacherAccess) {
    evaluationItems.push({
      title: "Notas",
      url: "/notas",
      icon: ClipboardList,
    })
  }

  if (hasFullAccess || hasPedagogicalAccess) {
    evaluationItems.push({
      title: "Relatórios",
      url: "/relatorios",
      icon: FileText,
    })
  }

  if (evaluationItems.length > 0) {
    navGroups.push({
      label: "Avaliações",
      items: evaluationItems,
    })
  }

  // Configurações - todos têm acesso
  const configItems = [
    {
      title: "Perfil",
      url: "/settings/user",
      icon: UserCircle,
    },
  ]

  if (hasFullAccess) {
    configItems.push({
      title: "Sistema",
      url: "/settings",
      icon: Settings,
    })
  }

  configItems.push({
    title: "Ajuda",
    url: "/faqs",
    icon: HelpCircle,
  })

  navGroups.push({
    label: "Configurações",
    items: configItems,
  })

  return navGroups
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser } = useAuth()

  const navUser = authUser
    ? {
        name: authUser.name ?? authUser.username,
        email: authUser.email,
        avatar: (authUser as any).avatar ?? null,
      }
    : null

  const navGroups = React.useMemo(
    () => getNavGroups(authUser?.role),
    [authUser?.role]
  )

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <School size={20} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">The House</span>
                  <span className="truncate text-xs">Gestão Educacional</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
  <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
