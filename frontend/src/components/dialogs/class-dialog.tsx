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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { classesApi, teachersApi, Class, ClassCreate, Teacher } from "@/lib/educational-api"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classItem?: Class
  onSuccess: () => void
}

export function ClassDialog({ open, onOpenChange, classItem, onSuccess }: ClassDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [formData, setFormData] = useState<ClassCreate>({
    name: "",
    description: "",
    level: "",
    teacher_id: 0,
    max_capacity: 30,
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    if (open) {
      loadTeachers()
    }
  }, [open])

  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name,
        description: classItem.description || "",
        level: classItem.level || "",
        teacher_id: classItem.teacher_id ?? undefined,
        max_capacity: classItem.max_capacity,
        start_date: classItem.start_date || "",
        end_date: classItem.end_date || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        level: "",
        teacher_id: 0,
        max_capacity: 30,
        start_date: "",
        end_date: "",
      })
    }
  }, [classItem, open])

  const loadTeachers = async () => {
    try {
      const data = await teachersApi.list()
      setTeachers(data)
    } catch (error) {
      console.error("Erro ao carregar professores:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (classItem) {
        await classesApi.update(classItem.id, {
          name: formData.name,
          description: formData.description || undefined,
          level: formData.level || undefined,
          teacher_id: formData.teacher_id,
          max_capacity: formData.max_capacity,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        })
        toast({
          title: "Turma atualizada!",
          description: "Os dados da turma foram atualizados com sucesso.",
        })
      } else {
        await classesApi.create(formData)
        toast({
          title: "Turma cadastrada!",
          description: "A turma foi cadastrada com sucesso.",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao salvar turma",
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
          <DialogTitle>{classItem ? "Editar Turma" : "Nova Turma"}</DialogTitle>
          <DialogDescription>
            {classItem
              ? "Atualize os dados da turma"
              : "Preencha os dados para cadastrar uma nova turma"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Turma *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: 5º Ano A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição da turma"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nível</Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Ex: Fundamental I, Médio..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Capacidade Máxima *</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  min="1"
                  value={formData.max_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 30 })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher_id">Professor Responsável</Label>
              <Select
                value={formData.teacher_id?.toString() || "0"}
                onValueChange={(value) =>
                  setFormData({ ...formData, teacher_id: value === "0" ? undefined : parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sem professor</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user.name}
                      {teacher.specialty && ` - ${teacher.specialty}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
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
              {classItem ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
