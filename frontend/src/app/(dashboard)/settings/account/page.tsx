"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

const accountFormSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuth()

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Carrega dados do usuário quando disponível
  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        email: user.email,
        username: user.username,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [user, form])

  async function onSubmit(data: AccountFormValues) {
    try {
      // TODO: Implementar atualização de dados no backend
      // Por enquanto, apenas simulamos o sucesso
      toast.success("Configurações atualizadas com sucesso!", {
        description: "Suas informações foram salvas."
      })
      
      // Limpa campos de senha
      form.setValue("currentPassword", "")
      form.setValue("newPassword", "")
      form.setValue("confirmPassword", "")
    } catch (error) {
      toast.error("Erro ao atualizar configurações", {
        description: "Tente novamente mais tarde."
      })
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Conta</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações e preferências da sua conta.
          </p>
          {user && (
            <div className="mt-4 flex gap-2">
              <Badge variant="outline">
                {user.role === "DIRECTOR" ? "Diretor(a)" : 
                 user.role === "COORDINATOR" ? "Coordenador(a)" :
                 user.role === "SECRETARY" ? "Secretário(a)" : "Professor(a)"}
              </Badge>
              <Badge variant={user.is_active ? "default" : "destructive"}>
                {user.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais que serão exibidas no seu perfil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço de Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Digite seu email" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome de usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha para manter sua conta segura.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite sua senha atual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite sua nova senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" className="cursor-pointer">Salvar Alterações</Button>
              <Button variant="outline" type="reset" className="cursor-pointer">Cancelar</Button>
            </div>
          </form>
        </Form>
      </div>
  )
}
