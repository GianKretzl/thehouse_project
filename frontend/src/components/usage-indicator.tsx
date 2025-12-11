"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, Infinity } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function UsageIndicator() {
  const router = useRouter()
  const isLoading = false
  const subscription = null

  // Componente desativado - não faz parte do sistema educacional
  return null
  
  if (false) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Uso Mensal
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {subscription.plan_name}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {subscription.usage_reset_at
            ? `Reinicia em ${new Date(subscription.usage_reset_at).toLocaleDateString('pt-BR')}`
            : 'Monitoramento de uso'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasUnlimitedVerifications ? (
          <div className="flex items-center justify-center py-4 text-center">
            <div className="space-y-2">
              <Infinity className="h-12 w-12 mx-auto text-primary" />
              <p className="text-sm font-medium">Verificações Ilimitadas</p>
              <p className="text-xs text-muted-foreground">
                Você já usou {subscription.monthly_verifications_used} verificações
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {subscription.monthly_verifications_used} de {subscription.monthly_verifications_limit}
                </span>
                <span className={cn(
                  "font-medium",
                  hasReachedLimit && "text-red-600",
                  isNearLimit && !hasReachedLimit && "text-yellow-600"
                )}>
                  {usagePercentage}%
                </span>
              </div>
              <Progress
                value={usagePercentage}
                className={cn(
                  "h-2",
                  hasReachedLimit && "[&>div]:bg-red-600",
                  isNearLimit && !hasReachedLimit && "[&>div]:bg-yellow-600"
                )}
              />
              <p className="text-xs text-muted-foreground">
                {subscription.verifications_remaining === 0
                  ? 'Limite atingido'
                  : `${subscription.verifications_remaining} verificações restantes`}
              </p>
            </div>

            {/* Alertas */}
            {hasReachedLimit && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-medium text-red-900 dark:text-red-200">
                      Limite mensal atingido
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Faça upgrade para continuar verificando sites
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => router.push('/dashboard/pricing')}
                    >
                      Ver Planos
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isNearLimit && !hasReachedLimit && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-medium text-yellow-900 dark:text-yellow-200">
                      Próximo do limite
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Considere fazer upgrade para mais verificações
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => router.push('/dashboard/pricing')}
                    >
                      <TrendingUp className="mr-2 h-3 w-3" />
                      Fazer Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
