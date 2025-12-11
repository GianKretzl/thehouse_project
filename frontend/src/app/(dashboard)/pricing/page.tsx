"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Info, Calendar, TrendingUp } from "lucide-react"

// Import data
import featuresData from "./data/features.json"
import faqsData from "./data/faqs.json"

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Planos e Preços</h1>
        <p className="text-muted-foreground mt-2">
          Esta funcionalidade não está disponível no sistema educacional.
        </p>
      </div>
    </div>
  )
  
  const subscription = null
  const apiPlans = []
  const changePlan = async () => {}
  const isLoading = false
  const [isChangingPlan, setIsChangingPlan] = useState(false)

  // Planos com informações locais
  const pricingPlans = [
    {
      id: 'free',
      name: 'Gratuito',
      description: 'Perfeito para começar a fazer compras com segurança',
      price: 'R$ 0',
      frequency: '',
      features: [
        '10 verificações por mês',
        'Verificação de sites',
        'Resultados claros e rápidos',
        'Lista de lojas confiáveis',
        'Tutoriais básicos',
        'Suporte por email'
      ],
      current: subscription?.plan_type === 'free',
    },
    {
      id: 'family',
      name: 'Família',
      description: 'Proteção para você e toda sua família',
      price: 'R$ 9,90',
      frequency: '/mês',
      features: [
        '100 verificações por mês',
        'Tudo do plano Gratuito',
        'Até 5 pessoas da família',
        'Alertas por SMS e WhatsApp',
        'Padrinho Digital (ajuda familiar)',
        'Tutoriais avançados',
        'Atendimento prioritário',
        'Relatórios mensais de segurança',
      ],
      popular: true,
      current: subscription?.plan_type === 'family',
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Máxima proteção e suporte dedicado',
      price: 'R$ 19,90',
      frequency: '/mês',
      features: [
        'Verificações ilimitadas',
        'Tudo do plano Família',
        'Suporte 24 horas por dia',
        'Assistente virtual inteligente',
        'Análise de pagamentos',
        'Proteção contra fraudes do Pix',
        'Consultoria pessoal de segurança',
        'Acesso a workshops online',
      ],
      current: subscription?.plan_type === 'premium',
    },
  ]

  const handlePlanSelect = async (planId: string) => {
    if (!subscription) {
      toast.error('Você precisa estar logado para mudar de plano')
      return
    }

    if (planId === subscription.plan_type) {
      toast.info('Este já é o seu plano atual')
      return
    }

    setIsChangingPlan(true)
    try {
      const success = await changePlan(planId as 'free' | 'family' | 'premium')
      if (success) {
        // Recarrega a página após 1.5s para atualizar as informações
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } finally {
      setIsChangingPlan(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-24 mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      {/* Informações da assinatura atual */}
      {subscription && (
        <section className="mb-8">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Plano Atual: {subscription.plan_name}
                      {subscription.plan_type !== 'free' && subscription.is_active && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/50">
                          Ativo
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subscription.monthly_verifications_limit === -1 ? (
                        'Verificações ilimitadas'
                      ) : (
                        <>
                          {subscription.monthly_verifications_used} de {subscription.monthly_verifications_limit} verificações usadas este mês
                          {subscription.verifications_remaining !== null && (
                            <span className="ml-2">
                              ({subscription.verifications_remaining} restantes)
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {subscription.subscription_expires_at && subscription.days_until_renewal !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Renova em {subscription.days_until_renewal} dias</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recomendações (se disponível) */}
      {apiPlans?.recommendations && apiPlans.recommendations.length > 0 && (
        <Alert className="mb-8">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Recomendação:</strong> {apiPlans.recommendations[0]}
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      <section className='pb-12' id='pricing'>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Escolha o melhor plano para você</h2>
          <p className="text-muted-foreground">
            Proteção online para você e sua família, com preços acessíveis
          </p>
        </div>

        <PricingPlans 
          plans={pricingPlans} 
          mode="billing"
          currentPlanId={subscription?.plan_type}
          onPlanSelect={handlePlanSelect}
        />

        <div className="mt-8 text-center">
          <Alert variant="default" className="max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertDescription>
              💳 Pagamento seguro • 🔒 Cancele quando quiser • ✨ Sem taxas escondidas
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesGrid features={featuresData} />

      {/* FAQ Section */}
      <FAQSection faqs={faqsData} />
    </div>
  )
}
