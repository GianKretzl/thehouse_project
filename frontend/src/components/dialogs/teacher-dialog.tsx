"use client"

import { useState, useEffect } from "react"
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
import { teachersApi, Teacher, TeacherCreate } from "@/lib/educational-api"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: Teacher
  onSuccess: () => void
}

export function TeacherDialog({ open, onOpenChange, teacher, onSuccess }: TeacherDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    phone: "",
    specialty: "",
    hire_date: "",
  })

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.user.name,
        email: teacher.user.email,
        password: "",
        cpf: teacher.cpf,
        phone: teacher.phone || "",
        specialty: teacher.specialty || "",
        hire_date: teacher.hire_date || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        cpf: "",
        phone: "",
        specialty: "",
        hire_date: "",
      })
    }
  }, [teacher, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (teacher) {
        await teachersApi.update(teacher.id, {
          phone: formData.phone || undefined,
          specialty: formData.specialty || undefined,
        })
        toast({
          title: "Professor atualizado!",
          description: "Os dados do professor foram atualizados com sucesso.",
        })
      } else {
        const teacherData: TeacherCreate = {
          cpf: formData.cpf,
          phone: formData.phone || undefined,
          specialty: formData.specialty || undefined,
          hire_date: formData.hire_date || undefined,
          user: {
            email: formData.email,
            name: formData.name,
            password: formData.password,
          },
        }
        await teachersApi.create(teacherData)
        toast({
          title: "Professor cadastrado!",
          description: "O professor foi cadastrado com sucesso.",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao salvar professor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{teacher ? "Editar Professor" : "Novo Professor"}</DialogTitle>
          <DialogDescription>
            {teacher
              ? "Atualize os dados do professor"
              : "Preencha os dados para cadastrar um novo professor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!!teacher}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!teacher}
                />
              </div>
            </div>

            {!teacher && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                  disabled={!!teacher}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex: Matemática, Português..."
                />
              </div>
              {!teacher && (
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Data de Contratação</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
              )}
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {teacher ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
