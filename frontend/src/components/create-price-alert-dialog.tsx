"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FavoriteProduct {
  id: number
  product_name: string
  current_price?: number
  initial_price: number
}

interface CreatePriceAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  favorite: FavoriteProduct
  onAlertCreated?: () => void
}

export function CreatePriceAlertDialog({
  open,
  onOpenChange,
  favorite,
  onAlertCreated
}: CreatePriceAlertDialogProps) {
  const [targetPrice, setTargetPrice] = useState<string>("")
  const [alertType, setAlertType] = useState<"below" | "above" | "exact">("below")
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido.",
        variant: "destructive",
      })
      return
    }

    const channels: string[] = []
    if (notifyEmail) channels.push("email")
    if (notifyWhatsApp) channels.push("whatsapp")

    if (channels.length === 0) {
      toast({
        title: "Selecione um canal",
        description: "Por favor, selecione pelo menos um canal de notificação.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await productsApi.createPriceAlert({
        favorite_product_id: favorite.id,
        target_price: parseFloat(targetPrice),
        alert_type: alertType,
        notification_channels: channels,
      })

      toast({
        title: "Alerta criado!",
        description: `Você será notificado quando o preço ${
          alertType === "below" ? "ficar abaixo de" :
          alertType === "above" ? "ficar acima de" :
          "for igual a"
        } R$ ${parseFloat(targetPrice).toFixed(2)}.`,
      })

      onAlertCreated?.()
      onOpenChange(false)
      
      // Reset form
      setTargetPrice("")
      setAlertType("below")
      setNotifyEmail(true)
      setNotifyWhatsApp(false)
    } catch (error: any) {
      console.error("Error creating alert:", error)
      toast({
        title: "Erro ao criar alerta",
        description: error.detail || "Não foi possível criar o alerta de preço.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = favorite.current_price || favorite.initial_price
  const suggestedPrice = (currentPrice * 0.9).toFixed(2) // 10% de desconto

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Criar Alerta de Preço
            </DialogTitle>
            <DialogDescription>
              Receba uma notificação quando o preço atingir seu objetivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Informações do Produto */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium text-sm line-clamp-2 mb-2">
                {favorite.product_name}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preço atual:</span>
                <span className="font-bold text-green-600">
                  R$ {currentPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tipo de Alerta */}
            <div className="space-y-2">
              <Label htmlFor="alertType">Tipo de Alerta</Label>
              <Select
                value={alertType}
                onValueChange={(value: "below" | "above" | "exact") => setAlertType(value)}
              >
                <SelectTrigger id="alertType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below">
                    Quando o preço ficar abaixo de
                  </SelectItem>
                  <SelectItem value="above">
                    Quando o preço ficar acima de
                  </SelectItem>
                  <SelectItem value="exact">
                    Quando o preço for exatamente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preço Alvo */}
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Preço Desejado</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={suggestedPrice}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sugestão: R$ {suggestedPrice} (10% de desconto)
              </p>
            </div>

            {/* Canais de Notificação */}
            <div className="space-y-3">
              <Label>Notificar via</Label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyEmail"
                    checked={notifyEmail}
                    onCheckedChange={(checked) => setNotifyEmail(checked as boolean)}
                  />
                  <Label 
                    htmlFor="notifyEmail" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    E-mail
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyWhatsApp"
                    checked={notifyWhatsApp}
                    onCheckedChange={(checked) => setNotifyWhatsApp(checked as boolean)}
                  />
                  <Label 
                    htmlFor="notifyWhatsApp" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    WhatsApp
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Alerta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
