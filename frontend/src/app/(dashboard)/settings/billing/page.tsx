"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BillingSettings() {
  // Página desativada - não faz parte do sistema educacional
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Cobrança</h1>
        <p className="text-muted-foreground mt-2">
          Esta funcionalidade não está disponível no sistema educacional.
        </p>
      </div>
    </div>
  )
  
  const isLoading = false
  const subscription = null
  const plans = []
  const history = []
  const changePlan = async () => {}
  const cancelSubscription = async () => {} 
  } = useSubscription()

  const handlePlanSelect = async (planId: string) => {
    if (!subscription) return
    
    if (planId === subscription.plan_type) {
      toast.info("Este já é o seu plano atual")
      return
    }

    // Valida o planId
    if (planId !== 'free' && planId !== 'family' && planId !== 'premium') {
      toast.error("Plano inválido")
      return
    }

    try {
      await changePlan(planId as 'free' | 'family' | 'premium')
      toast.success("Plano alterado com sucesso!", {
        description: `Seu plano foi alterado para ${planId}`
      })
    } catch (error) {
      toast.error("Erro ao alterar plano", {
        description: "Não foi possível alterar seu plano. Tente novamente."
      })
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription()
      toast.success("Assinatura cancelada", {
        description: "Sua assinatura foi cancelada com sucesso. Você ainda pode usar até o fim do período pago."
      })
    } catch (error) {
      toast.error("Erro ao cancelar assinatura", {
        description: "Não foi possível cancelar sua assinatura. Tente novamente."
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Planos e Pagamento</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e informações de pagamento.
          </p>
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Converte dados da API para o formato esperado pelos componentes
  const currentPlanData = subscription ? {
    planName: subscription.plan_name,
    price: subscription.price > 0 ? `R$ ${subscription.price.toFixed(2)}/mês` : 'Gratuito',
    nextBilling: subscription.subscription_expires_at 
      ? new Date(subscription.subscription_expires_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : 'N/A',
    status: subscription.is_active ? 'Ativo' : 'Inativo',
    daysUsed: subscription.days_until_renewal !== null 
      ? Math.max(0, 30 - subscription.days_until_renewal)
      : 0,
    totalDays: 30,
    progressPercentage: subscription.days_until_renewal !== null 
      ? Math.round(((30 - subscription.days_until_renewal) / 30) * 100)
      : 0,
    remainingDays: subscription.days_until_renewal || 0,
    needsAttention: !subscription.is_active || (subscription.days_until_renewal !== null && subscription.days_until_renewal < 7),
    attentionMessage: !subscription.is_active 
      ? 'Sua assinatura está inativa'
      : subscription.days_until_renewal !== null && subscription.days_until_renewal < 7
      ? `Sua assinatura expira em ${subscription.days_until_renewal} dias`
      : 'Tudo certo com sua assinatura!'
  } : null;

  const billingHistoryData = history.map(item => ({
    id: item.id,
    month: new Date(item.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    plan: item.new_plan === 'premium' ? 'Plano Premium' : 
          item.new_plan === 'family' ? 'Plano Família' : 'Plano Gratuito',
    amount: item.amount !== null ? `R$ ${item.amount.toFixed(2)}` : 'Gratuito',
    status: item.action === 'upgrade' ? 'Upgrade' : 
            item.action === 'downgrade' ? 'Downgrade' : 
            item.action === 'cancel' ? 'Cancelado' : 'Renovado'
  }));

  return (
    <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Planos e Pagamento</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e informações de pagamento.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {currentPlanData && <CurrentPlanCard plan={currentPlanData} />}
          {billingHistoryData.length > 0 && <BillingHistoryCard history={billingHistoryData} />}
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Planos Disponíveis</CardTitle>
              <CardDescription>
                Escolha o plano que melhor funciona para você.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricingPlans 
                mode="billing" 
                currentPlanId={subscription?.plan_type || 'free'}
                onPlanSelect={handlePlanSelect}
              />
            </CardContent>
          </Card>

          {subscription && subscription.plan_type !== 'free' && subscription.is_active && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Zona de Perigo</CardTitle>
                <CardDescription>
                  Ações irreversíveis relacionadas à sua assinatura.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Cancelar Assinatura</h4>
                    <p className="text-sm text-muted-foreground">
                      Você ainda terá acesso até o fim do período pago.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancelar Assinatura</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você perderá acesso aos benefícios do plano {subscription.plan_name} após o término do período atual.
                          Você ainda poderá usar os recursos até {currentPlanData?.nextBilling}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sim, Cancelar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  )
}
