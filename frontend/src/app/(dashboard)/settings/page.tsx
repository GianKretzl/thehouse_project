"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle, Bell, Shield, CreditCard, Settings as SettingsIcon } from "lucide-react"

const settingsCategories = [
  {
    title: "Dados Pessoais",
    description: "Gerencie suas informações pessoais e preferências",
    icon: UserCircle,
    href: "/settings/user",
    color: "text-blue-500",
  },
  {
    title: "Notificações",
    description: "Configure alertas e notificações de segurança",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-yellow-500",
  },
  {
    title: "Segurança da Conta",
    description: "Senha, autenticação e configurações de segurança",
    icon: Shield,
    href: "/settings/account",
    color: "text-green-500",
  },
  {
    title: "Plano e Pagamento",
    description: "Gerenciar assinatura e métodos de pagamento",
    icon: CreditCard,
    href: "/settings/billing",
    color: "text-purple-500",
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações e preferências da conta NetSaber
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsCategories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.href} href={category.href}>
              <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <SettingsIcon className="h-5 w-5" />
            Dica de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <p>
            Mantenha suas informações sempre atualizadas e ative a autenticação em duas etapas
            para garantir a máxima segurança da sua conta. Revise regularmente suas configurações
            de notificação para receber alertas importantes sobre sua proteção online.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
