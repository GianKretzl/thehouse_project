"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Users, BookOpen, GraduationCap, Calendar } from "lucide-react";

interface DashboardStats {
  total_turmas: number;
  total_professores: number;
  total_alunos: number;
  total_aulas_hoje: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/dashboard/stats");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Turmas",
      value: stats?.total_turmas || 0,
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Professores",
      value: stats?.total_professores || 0,
      icon: GraduationCap,
      color: "bg-purple-500",
    },
    {
      title: "Alunos",
      value: stats?.total_alunos || 0,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Aulas Hoje",
      value: stats?.total_aulas_hoje || 0,
      icon: Calendar,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard Administrativo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Atividades Recentes
          </h2>
          <p className="text-gray-500">Nenhuma atividade recente</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Próximas Aulas
          </h2>
          <p className="text-gray-500">Nenhuma aula agendada</p>
        </div>
      </div>
    </div>
  );
}
