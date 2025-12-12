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
import { studentsApi, Student, StudentCreate } from "@/lib/educational-api"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student
  onSuccess: () => void
}

export function StudentDialog({ open, onOpenChange, student, onSuccess }: StudentDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<StudentCreate>({
    name: "",
    cpf: "",
    email: "",
    birth_date: "",
    phone: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
  })

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        cpf: student.cpf,
        email: student.email || "",
        birth_date: student.birth_date || "",
        phone: student.phone || "",
        address: student.address || "",
        guardian_name: student.guardian_name || "",
        guardian_phone: student.guardian_phone || "",
      })
    } else {
      setFormData({
        name: "",
        cpf: "",
        email: "",
        birth_date: "",
        phone: "",
        address: "",
        guardian_name: "",
        guardian_phone: "",
      })
    }
  }, [student, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (student) {
        await studentsApi.update(student.id, {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          guardian_name: formData.guardian_name || undefined,
          guardian_phone: formData.guardian_phone || undefined,
        })
        toast({
          title: "Aluno atualizado!",
          description: "Os dados do aluno foram atualizados com sucesso.",
        })
      } else {
        await studentsApi.create(formData)
        toast({
          title: "Aluno cadastrado!",
          description: "O aluno foi cadastrado com sucesso.",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao salvar aluno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
          <DialogDescription>
            {student
              ? "Atualize os dados do aluno"
              : "Preencha os dados para cadastrar um novo aluno"}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                  disabled={!!student}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Dados do Responsável</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Nome do Responsável</Label>
                  <Input
                    id="guardian_name"
                    value={formData.guardian_name}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Telefone do Responsável</Label>
                  <Input
                    id="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {student ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
