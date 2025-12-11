"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, AlertCircle, Zap, Shield, Users } from "lucide-react"
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: 'limit_reached' | 'near_limit' | 'manual'
  currentUsage?: {
    used: number
    limit: number
    percentage: number
  }
}

// Componente desativado - não faz parte do sistema educacional
export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  return null
}

const planFeatures = {
  free: {
    name: 'Gratuito',
    price: 'R$ 0',
    frequency: '',
    verifications: '10 verificações/mês',
    features: [
      'Verificação de sites',
      'Resultados claros e rápidos',
      'Lista de lojas confiáveis',
      'Tutoriais básicos',
      'Suporte por email',
    ],
    icon: Shield,
    color: 'text-gray-500',
    popular: false,
  },
  family: {
    name: 'Família',
    price: 'R$ 9,90',
    frequency: '/mês',
    verifications: '100 verificações/mês',
    features: [
      'Tudo do plano Gratuito',
      'Até 5 pessoas da família',
      'Alertas por SMS e WhatsApp',
      'Padrinho Digital',
      'Tutoriais avançados',
      'Atendimento prioritário',
      'Relatórios mensais',
    ],
    icon: Users,
    color: 'text-blue-500',
    popular: true,
  },
  premium: {
    name: 'Premium',
    price: 'R$ 19,90',
    frequency: '/mês',
    verifications: 'Verificações ilimitadas',
    features: [
      'Tudo do plano Família',
      'Suporte 24/7',
      'Assistente virtual IA',
      'Análise de pagamentos',
      'Proteção Pix',
      'Consultoria pessoal',
      'Workshops online',
    ],
    icon: Zap,
    color: 'text-purple-500',
    popular: false,
  },
}

export function UpgradeModal({ open, onOpenChange, reason = 'manual', currentUsage }: UpgradeModalProps) {
  const { subscription, changePlan, isLoading } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<'family' | 'premium' | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const currentPlan = subscription?.plan_type || 'free'

  const handleUpgrade = async (plan: 'family' | 'premium') => {
    setIsUpgrading(true)
    try {
      const success = await changePlan(plan)
      if (success) {
        toast.success(`Plano alterado para ${planFeatures[plan].name} com sucesso!`)
        onOpenChange(false)
        // Recarregar a página para atualizar os limites
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const getReasonMessage = () => {
    switch (reason) {
      case 'limit_reached':
        return {
          title: '🚫 Limite de verificações atingido',
          description: 'Você atingiu o limite mensal do plano gratuito. Faça upgrade para continuar verificando sites com segurança!',
          variant: 'destructive' as const,
        }
      case 'near_limit':
        return {
          title: '⚠️ Próximo do limite',
          description: `Você já usou ${currentUsage?.percentage || 0}% do seu limite mensal. Considere fazer upgrade para não ficar sem verificações.`,
          variant: 'default' as const,
        }
      default:
        return {
          title: '✨ Desbloqueie mais recursos',
          description: 'Aproveite todos os recursos premium e proteja você e sua família online!',
          variant: 'default' as const,
        }
    }
  }

  const reasonMessage = getReasonMessage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Escolha o melhor plano para você</DialogTitle>
          <DialogDescription>
            Compare os planos e escolha o que melhor se encaixa nas suas necessidades
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de motivo */}
        <Alert variant={reasonMessage.variant} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <strong>{reasonMessage.title}</strong>
              <p className="text-sm mt-1">{reasonMessage.description}</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Uso atual (se disponível) */}
        {currentUsage && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Uso mensal</span>
              <span className="text-sm text-muted-foreground">
                {currentUsage.used} de {currentUsage.limit} verificações
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2.5">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  currentUsage.percentage >= 100 ? "bg-red-500" :
                  currentUsage.percentage >= 80 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${Math.min(currentUsage.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Comparação de planos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(planFeatures).map(([key, plan]) => {
            const PlanIcon = plan.icon
            const isCurrent = currentPlan === key
            const canSelect = key !== 'free' && key !== currentPlan
            const isSelected = selectedPlan === key

            return (
              <Card
                key={key}
                className={cn(
                  'relative transition-all',
                  plan.popular && 'border-primary shadow-lg',
                  isCurrent && 'border-green-500 bg-green-50/50 dark:bg-green-950/20',
                  isSelected && 'border-primary ring-2 ring-primary',
                  canSelect && 'cursor-pointer hover:shadow-lg'
                )}
                onClick={() => canSelect && setSelectedPlan(key as any)}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="flex gap-1.5 items-center font-medium">
                      <Sparkles className="h-3 w-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="outline" className="bg-green-500 text-white border-green-600">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center space-y-2 pt-8">
                  <div className="mx-auto mb-2">
                    <PlanIcon className={cn("h-8 w-8", plan.color)} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.verifications}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.frequency}</span>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : key === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Básico
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleUpgrade(key as any)}
                      disabled={isUpgrading || isLoading}
                    >
                      {isUpgrading && selectedPlan === key
                        ? 'Processando...'
                        : 'Fazer Upgrade'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💳 Pagamento seguro • 🔒 Cancele quando quiser • ✨ Sem taxas escondidas</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
