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

  // Turmas - Admin/Pedagogo veem todas, Professor vê suas turmas
  if (hasAdminAccess || hasPedagogicalAccess || hasTeacherAccess) {
    academicItems.push({
      title: "Turmas",
      url: "/turmas",
      icon: School,
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
                <div className="flex items-center justify-center">
                  <Logo size={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#1e3a8a]">The</span>
                    <span className="font-bold text-[#b91c1c]">House</span>
                  </div>
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
