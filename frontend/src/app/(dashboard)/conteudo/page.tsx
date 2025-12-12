"use client"

import { useState, useEffect } from "react"
import { classesApi, Class, lessonsApi, Lesson } from "@/lib/educational-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, BookOpen, Plus, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function ContentPage() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    content: "",
    notes: "",
  })

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadLessons(parseInt(selectedClass))
    }
  }, [selectedClass])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await classesApi.list()
      setClasses(data)
      if (data.length > 0) {
        setSelectedClass(data[0].id.toString())
      }
    } catch (error) {
      console.error("Erro ao carregar turmas:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar turmas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async (classId: number) => {
    try {
      setLoading(true)
      const data = await lessonsApi.list(classId)
      // Ordenar por data decrescente
      setLessons(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (error) {
      console.error("Erro ao carregar aulas:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar aulas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) return

    try {
      if (editingLesson) {
        await lessonsApi.update(editingLesson.id, {
          content: formData.content,
          notes: formData.notes,
        })
        toast({
          title: "Conteúdo atualizado!",
          description: "O conteúdo da aula foi atualizado com sucesso.",
        })
      } else {
        await lessonsApi.create({
          class_id: parseInt(selectedClass),
          date: formData.date,
          content: formData.content,
          notes: formData.notes,
        })
        toast({
          title: "Conteúdo registrado!",
          description: "O conteúdo da aula foi registrado com sucesso.",
        })
      }
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        content: "",
        notes: "",
      })
      setEditingLesson(null)
      setShowForm(false)
      loadLessons(parseInt(selectedClass))
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao salvar conteúdo",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setFormData({
      date: lesson.date,
      content: lesson.content || "",
      notes: lesson.notes || "",
    })
    setEditingLesson(lesson)
    setShowForm(true)
  }

  const handleDelete = async (lessonId: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return

    try {
      await lessonsApi.delete(lessonId)
      toast({
        title: "Conteúdo excluído!",
        description: "O registro foi excluído com sucesso.",
      })
      loadLessons(parseInt(selectedClass))
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao excluir",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingLesson(null)
    setFormData({
      date: new Date().toISOString().split("T")[0],
      content: "",
      notes: "",
    })
  }

  const currentClass = classes.find((c) => c.id.toString() === selectedClass)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conteúdo</h1>
          <p className="text-muted-foreground">
            Gerencie o conteúdo ministrado nas aulas
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Conteúdo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Conteúdo</CardTitle>
              <CardDescription>
                Turma: {currentClass?.name || "Selecione uma turma"}
              </CardDescription>
            </div>
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={loading}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name}
                    {classItem.level && ` - ${classItem.level}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4 bg-muted/20">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingLesson ? "Editar Registro" : "Novo Registro"}
              </h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data da Aula *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    disabled={!!editingLesson}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo Ministrado *</Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva o conteúdo abordado na aula..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais (opcional)..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingLesson ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : !currentClass ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Selecione uma turma</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum conteúdo registrado para esta turma
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">
                          {new Date(lesson.date).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        Conteúdo
                      </h4>
                      <p className="text-sm">{lesson.content || "-"}</p>
                    </div>
                    {lesson.notes && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Observações
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
