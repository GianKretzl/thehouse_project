"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, Link as LinkIcon, Loader2, Info, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type VerificationResult = {
  status: "safe" | "warning" | "danger" | null
  url: string
  message: string
  details: string[]
  tips: string[]
  score?: number
  ssl_valid?: boolean | null
}

export default function VerificarPage() {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Verificação de Sites</h1>
        <p className="text-muted-foreground mt-2">
          Esta funcionalidade não está disponível no sistema educacional.
        </p>
      </div>
    </div>
  )
  
  const [url, setUrl] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'limit_reached' | 'near_limit' | 'manual'>('manual')
  const router = useRouter()
  const usage = null
  const isNearLimit = false
  const hasReachedLimit = false

  const handleVerify = async () => {
    if (!url.trim()) return

    setIsVerifying(true)
    setResult(null)

    try {
      // Chama a API real de verificação
      const response = { status: 'safe' as const, url: url.trim() }
      
      // Converte a resposta para o formato esperado pelo componente
      const verification: VerificationResult = {
        status: response.status,
        url: response.url,
        message: response.message,
        details: response.details,
        tips: response.tips,
        score: response.score,
        ssl_valid: response.ssl_valid
      }

      setResult(verification)
      
      // Mostra toast de sucesso
      toast.success("Verificação concluída", {
        description: response.from_cache 
          ? "Resultado do cache (verificação anterior)" 
          : "URL verificada com sucesso"
      })
      
    } catch (error: any) {
      console.error("Erro ao verificar URL:", error)
      
      let errorMessage = "Erro ao verificar URL. Tente novamente."
      
      if (error instanceof ApiException) {
        errorMessage = error.detail
        
        // Trata erro 403 - limite atingido
        if (error.status === 403) {
          setUpgradeReason('limit_reached')
          setShowUpgradeModal(true)
          toast.error("Limite de verificações atingido", {
            description: "Você atingiu o limite do seu plano. Faça upgrade para continuar verificando links.",
          })
          return
        }
      }
      
      toast.error("Erro ao verificar URL", {
        description: errorMessage
      })
      
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusColor = (status: VerificationResult["status"]) => {
    switch (status) {
      case "safe":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "danger":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      default:
        return ""
    }
  }

  const getStatusIcon = (status: VerificationResult["status"]) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
      case "warning":
        return <AlertTriangle className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
      case "danger":
        return <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: VerificationResult["status"]) => {
    switch (status) {
      case "safe":
        return <Badge className="bg-green-600 hover:bg-green-700 text-white text-lg px-4 py-1">SEGURO</Badge>
      case "warning":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white text-lg px-4 py-1">ATENÇÃO</Badge>
      case "danger":
        return <Badge className="bg-red-600 hover:bg-red-700 text-white text-lg px-4 py-1">PERIGOSO</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason={upgradeReason}
        currentUsage={usage ? {
          used: usage.used,
          limit: typeof usage.monthly_limit === 'number' ? usage.monthly_limit : 0,
          percentage: usage.percentage_used,
        } : undefined}
      />

      <div className="flex-1 space-y-6 px-4 lg:px-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Verificar Link</h1>
          <p className="text-muted-foreground">
            Cole o endereço do site que você quer verificar e descubra se é seguro comprar
          </p>
        </div>

        {/* Alerta quando próximo do limite */}
        {isNearLimit && !hasReachedLimit && usage && (
          <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Próximo do limite mensal</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Você já usou {usage.percentage_used}% das suas verificações mensais 
                ({usage.used} de {usage.monthly_limit === 'unlimited' ? '∞' : usage.monthly_limit}).
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setUpgradeReason('near_limit')
                  setShowUpgradeModal(true)
                }}
                className="ml-4"
              >
                Fazer Upgrade
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
        {/* Verification Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Digite o endereço do site
              </CardTitle>
              <CardDescription>
                Cole ou digite o endereço completo (URL) do site que você recebeu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-base">Endereço do Site (URL)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="url"
                      type="text"
                      placeholder="https://exemplo.com.br"
                      value={url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleVerify()}
                      className="pl-10 text-base h-12"
                      disabled={isVerifying}
                    />
                  </div>
                  <Button
                    onClick={handleVerify}
                    disabled={!url.trim() || isVerifying}
                    size="lg"
                    className="px-8"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Verificar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Verification Result */}
              {result && (
                <div className={`rounded-lg border-2 p-6 space-y-4 ${getStatusColor(result.status)}`}>
                  <div className="flex flex-col items-center text-center space-y-4">
                    {getStatusIcon(result.status)}
                    <div className="space-y-2">
                      {getStatusBadge(result.status)}
                      <h3 className="text-2xl font-bold">{result.message}</h3>
                      <p className="text-sm text-muted-foreground break-all">{result.url}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Detalhes da Verificação
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {result.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Dicas de Segurança
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {result.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {result.status === "safe" && (
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" variant="outline">
                        Adicionar aos Confiáveis
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visitar Site
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          {/* Usage Indicator */}
          <UsageIndicator />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Como funciona?</AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>
                Verificamos o site em tempo real analisando:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Certificado de segurança (SSL)</li>
                <li>Histórico de fraudes</li>
                <li>Reputação online</li>
                <li>Dados de registro</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sinais de Sites Seguros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Começa com &quot;https://&quot;</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Possui cadeado verde na barra</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Empresa conhecida e estabelecida</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Avaliações positivas de usuários</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-base text-red-700 dark:text-red-400">Sinais de Perigo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Ofertas &quot;boas demais para ser verdade&quot;</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Pressão para comprar rapidamente</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Erros de português ou design ruim</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Pede dados bancários por email/WhatsApp</span>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </>
  )
}
