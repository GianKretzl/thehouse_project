"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Mail, MessageCircle, Loader2 } from "lucide-react"
import { notificationsApi } from "@/lib/api"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const notificationsFormSchema = z.object({
  danger_url: z.boolean(),
  phishing: z.boolean(),
  limit_warning: z.boolean(),
  limit_reached: z.boolean(),
  subscription_changed: z.boolean(),
  subscription_expired: z.boolean(),
  email_enabled: z.boolean(),
  whatsapp_enabled: z.boolean(),
  whatsapp_number: z.string().optional(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      danger_url: true,
      phishing: true,
      limit_warning: true,
      limit_reached: true,
      subscription_changed: true,
      subscription_expired: true,
      email_enabled: true,
      whatsapp_enabled: false,
      whatsapp_number: "",
    },
  })

  // Carrega preferências ao montar o componente
  useEffect(() => {
    async function loadPreferences() {
      try {
        const prefs = await notificationsApi.getPreferences()
        form.reset({
          danger_url: prefs.danger_url,
          phishing: prefs.phishing,
          limit_warning: prefs.limit_warning,
          limit_reached: prefs.limit_reached,
          subscription_changed: prefs.subscription_changed,
          subscription_expired: prefs.subscription_expired,
          email_enabled: prefs.email_enabled,
          whatsapp_enabled: prefs.whatsapp_enabled,
          whatsapp_number: prefs.whatsapp_number || "",
        })
      } catch (error) {
        toast.error("Erro ao carregar preferências", {
          description: "Não foi possível carregar suas preferências de notificação"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadPreferences()
  }, [form])

  async function onSubmit(data: NotificationsFormValues) {
    setIsSaving(true)
    try {
      await notificationsApi.updatePreferences({
        danger_url: data.danger_url,
        phishing: data.phishing,
        limit_warning: data.limit_warning,
        limit_reached: data.limit_reached,
        subscription_changed: data.subscription_changed,
        subscription_expired: data.subscription_expired,
        email_enabled: data.email_enabled,
        whatsapp_enabled: data.whatsapp_enabled,
        whatsapp_number: data.whatsapp_number || null,
        notification_email: data.email_enabled,
        notification_whatsapp: data.whatsapp_enabled,
      })
      toast.success("Preferências salvas!", {
        description: "Suas preferências de notificação foram atualizadas com sucesso"
      })
    } catch (error) {
      toast.error("Erro ao salvar preferências", {
        description: "Não foi possível salvar suas preferências. Tente novamente."
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Configure como você recebe alertas de segurança.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Notificações</CardTitle>
                    <CardDescription>
                      Escolha quais alertas você deseja receber para manter suas compras seguras.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="danger_url"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-medium">URLs Perigosas</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receba alertas quando verificar um site classificado como perigoso.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phishing"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-medium">Tentativas de Phishing</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Seja alertado sobre sites que tentam roubar suas informações pessoais.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="limit_warning"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-medium">Aviso de Limite</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receba um aviso quando estiver próximo do limite de verificações.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="limit_reached"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-medium">Limite Atingido</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Seja notificado quando atingir o limite mensal de verificações.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription_changed"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-medium">Mudança de Plano</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receba confirmação quando seu plano for alterado.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription_expired"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-medium">Assinatura Expirada</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Seja alertado quando sua assinatura expirar ou estiver prestes a expirar.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Como Receber</CardTitle>
                <CardDescription>
                  Escolha por quais meios você quer receber as notificações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <FormLabel className="text-base font-medium">Email</FormLabel>
                            <div className="text-sm text-muted-foreground">Receber notificações por email</div>
                          </div>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <FormField
                    control={form.control}
                    name="whatsapp_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <FormLabel className="text-base font-medium">WhatsApp</FormLabel>
                            <div className="text-sm text-muted-foreground">Receber notificações por WhatsApp</div>
                          </div>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch("whatsapp_enabled") && (
                    <FormField
                      control={form.control}
                      name="whatsapp_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+5511999999999"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Digite o número com código do país (ex: +5511999999999)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isSaving} className="cursor-pointer">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Preferências"
                )}
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => form.reset()}
                disabled={isSaving}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </div>
  )
}
