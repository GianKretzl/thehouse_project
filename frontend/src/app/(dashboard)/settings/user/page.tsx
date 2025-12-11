"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent,CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2 } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { usersApi } from "@/lib/api"

const userFormSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function UserSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [useDefaultIcon, setUseDefaultIcon] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { user, loading: authLoading, refreshUser } = useAuth()
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      username: "",
    },
  })

  // Carrega dados do usuário
  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        email: user.email,
        username: user.username,
      })
    }
  }, [user, form])

  async function onSubmit(data: UserFormValues) {
    setIsSaving(true)
    try {
      // Se foi selecionado um arquivo, faz upload primeiro
      if (selectedFile) {
        try {
          await usersApi.uploadAvatar(selectedFile)
        } catch (err) {
          console.error('Erro ao fazer upload do avatar:', err)
          // Continua para tentar salvar os outros campos, mas avisa o usuário
          toast.error('Erro ao enviar imagem. As alterações de texto ainda serão salvas.')
        }
      }

      // Chama endpoint para atualizar usuário (texto)
      await usersApi.updateMe({
        full_name: data.full_name,
        username: data.username,
        // email permanece desabilitado na UI, mas permitimos enviar se necessário
        email: data.email,
      })

      // Recarrega dados do usuário no contexto
      try {
        await refreshUser()
      } catch (err) {
        // Se falhar em recarregar, não bloqueia — apenas loga
        console.error('Erro ao recarregar usuário após atualização:', err)
      }

      toast.success("Perfil atualizado com sucesso!", {
        description: "Suas informações foram salvas."
      })
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error("Erro ao atualizar perfil", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        setUseDefaultIcon(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    setProfileImage(null)
    setUseDefaultIcon(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (authLoading) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Atualize suas informações pessoais básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 ">
              {useDefaultIcon ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg">
                  <Logo size={56} />
                </div>
              ) : (
                <Avatar className="h-20 w-20 rounded-lg">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback>
                    {user?.username?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleFileUpload}
                    type="button"
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Carregar foto
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReset}
                    type="button"
                    className="cursor-pointer"
                  >
                    Resetar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Permitido JPG, GIF ou PNG. Tamanho máximo de 800KB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/gif,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator className="mb-10" />
            
            {/* Form Fields - Simplificado para dados do backend */}
            <div className="grid grid-cols-1 gap-6">
              {/* Nome Completo */}
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

              {/* Username */}
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

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Digite seu email" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-start gap-3">
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
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
          </CardContent>
        </Card>
          </form>
        </Form>
      </div>
  )
}
