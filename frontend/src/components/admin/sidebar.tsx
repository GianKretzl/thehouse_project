"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  ClipboardList,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Professores",
    href: "/admin/professores",
    icon: GraduationCap,
  },
  {
    title: "Alunos",
    href: "/admin/alunos",
    icon: Users,
  },
  {
    title: "Turmas",
    href: "/admin/turmas",
    icon: BookOpen,
  },
  {
    title: "Horários",
    href: "/admin/horarios",
    icon: Calendar,
  },
  {
    title: "Relatórios",
    href: "/admin/relatorios",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-primary-600 to-primary-800 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">The House</h1>
        <p className="text-sm text-primary-100">Instituto Educacional</p>
      </div>

      <nav className="px-3 space-y-1">
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-white text-primary-600 font-semibold"
                  : "text-primary-50 hover:bg-primary-500"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
