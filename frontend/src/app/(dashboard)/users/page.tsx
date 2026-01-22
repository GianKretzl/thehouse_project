"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Shield, Calendar, Activity, CreditCard, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth()
  const subLoading = false
  const usageLoading = false
  const subscription = null
  const usage = null
  const router = useRouter()

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getInitials = (name: string | null) => {
    if (!name) return user.username?.substring(0, 2).toUpperCase() || 'US'
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Perfil do Usuário</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas informações de conta
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.full_name ?? null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.full_name || user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={user.is_verified ? "default" : "secondary"}>
                    {user.is_verified ? "✓ Verificado" : "Não Verificado"}
                  </Badge>
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/settings/user')}>
              Editar Perfil
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Plano Atual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {subscription?.plan_name || user.plan_type}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscription?.is_active ? (
                <>
                  <CheckCircle2 className="inline h-3 w-3 mr-1 text-green-500" />
                  Ativo
                </>
              ) : (
                <>
                  <AlertCircle className="inline h-3 w-3 mr-1 text-yellow-500" />
                  Inativo
                </>
              )}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => router.push('/dashboard/pricing')}
            >
              Gerenciar Plano
            </Button>
          </CardContent>
        </Card>

        {/* Uso Mensal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Mensal</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage?.used || 0} / {usage?.monthly_limit === 'unlimited' ? '∞' : usage?.monthly_limit || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Verificações este mês
            </p>
            {usage && usage.monthly_limit !== 'unlimited' && (
              <Progress 
                value={usage.percentage_used} 
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>

        {/* Data de Cadastro */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membro Desde</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(user.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Detalhes completos da sua conta The House</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome de Usuário</p>
              <p className="text-sm mt-1">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p className="text-sm mt-1">{user.full_name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Plano</p>
              <p className="text-sm mt-1 capitalize">{user.plan_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Perfil</p>
              <p className="text-sm mt-1">{user.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID da Conta</p>
              <p className="text-sm mt-1 font-mono">#{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/settings/account')}>
            <User className="mr-2 h-4 w-4" />
            Editar Conta
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/settings/notifications')}>
            <Shield className="mr-2 h-4 w-4" />
            Notificações
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/pricing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Gerenciar Assinatura
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
