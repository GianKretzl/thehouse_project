"use client"

import { useState, useEffect } from "react"
import { 
  assessmentsApi, 
  Assessment, 
  AssessmentCreate,
  classesApi, 
  Class, 
  enrollmentsApi, 
  Enrollment,
  lessonsApi,
  Lesson
} from "@/lib/educational-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, GraduationCap, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function AssessmentsPage() {
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Enrollment[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [formData, setFormData] = useState<Partial<AssessmentCreate>>({
    type: "Prova",
    grade: 0,
    weight: 1.0,
    assessment_date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      const classId = parseInt(selectedClassId)
      loadClassData(classId)
    }
  }, [selectedClassId])

  const loadClasses = async () => {
    try {
      const data = await classesApi.list()
      setClasses(data)
      if (data.length > 0) {
        setSelectedClassId(data[0].id.toString())
      }
    } catch (error: any) {
      console.error("Erro ao carregar turmas:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar turmas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadClassData = async (classId: number) => {
    try {
      setLoading(true)
      const [assessmentsData, studentsData, lessonsData] = await Promise.all([
        assessmentsApi.list(classId),
        enrollmentsApi.getClassStudents(classId),
        lessonsApi.list(classId),
      ])
      setAssessments(assessmentsData)
      // Ordenar alunos alfabeticamente
      const sortedStudents = studentsData.sort((a, b) => 
        a.student.name.localeCompare(b.student.name, 'pt-BR')
      )
      setStudents(sortedStudents)
      setLessons(lessonsData)
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.lesson_id || !formData.student_id || !formData.type || formData.grade === undefined) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingAssessment) {
        await assessmentsApi.update(editingAssessment.id, formData as any)
        toast({
          title: "Avaliação atualizada!",
          description: "A nota foi atualizada com sucesso.",
        })
      } else {
        await assessmentsApi.create(formData as AssessmentCreate)
        toast({
          title: "Avaliação registrada!",
          description: "A nota foi registrada com sucesso.",
        })
      }
      
      setShowDialog(false)
      setEditingAssessment(null)
      resetForm()
      loadClassData(parseInt(selectedClassId))
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao salvar avaliação",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment)
    setFormData({
      lesson_id: assessment.lesson_id,
      student_id: assessment.student_id,
      type: assessment.type,
      grade: assessment.grade,
      weight: assessment.weight,
      note: assessment.note || "",
      assessment_date: assessment.assessment_date,
    })
    setShowDialog(true)
  }

  const handleDelete = async (assessmentId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return

    try {
      await assessmentsApi.delete(assessmentId)
      toast({
        title: "Avaliação excluída!",
        description: "A avaliação foi removida com sucesso.",
      })
      loadClassData(parseInt(selectedClassId))
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao excluir",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      type: "Prova",
      grade: 0,
      weight: 1.0,
      assessment_date: new Date().toISOString().split("T")[0],
    })
  }

  const getStudentName = (studentId: number) => {
    const enrollment = students.find(s => s.student.id === studentId)
    return enrollment ? enrollment.student.name : "N/A"
  }

  const getLessonDate = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId)
    return lesson ? new Date(lesson.date).toLocaleDateString("pt-BR") : "N/A"
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 7) return "default"
    if (grade >= 5) return "secondary"
    return "destructive"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const selectedClass = classes.find(c => c.id.toString() === selectedClassId)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
          <p className="text-muted-foreground">
            Gerencie as avaliações dos alunos
          </p>
        </div>
        <Button 
          disabled={!selectedClassId || students.length === 0 || lessons.length === 0}
          onClick={() => {
            resetForm()
            setEditingAssessment(null)
            setShowDialog(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Avaliações</CardTitle>
              <CardDescription>
                {selectedClass
                  ? `Turma: ${selectedClass.name}`
                  : "Selecione uma turma"}
              </CardDescription>
            </div>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando avaliações...</div>
          ) : !selectedClassId ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecione uma turma para ver as avaliações
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum aluno matriculado</h3>
              <p className="text-sm text-muted-foreground">
                Matricule alunos nesta turma antes de lançar avaliações
              </p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma aula registrada</h3>
              <p className="text-sm text-muted-foreground">
                Registre aulas antes de lançar avaliações
              </p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma avaliação registrada</h3>
              <p className="text-sm text-muted-foreground">
                Comece criando a primeira avaliação para esta turma
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Aula</TableHead>
                  <TableHead>Data Avaliação</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      {getStudentName(assessment.student_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {assessment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getLessonDate(assessment.lesson_id)}</TableCell>
                    <TableCell>{formatDate(assessment.assessment_date)}</TableCell>
                    <TableCell>
                      <Badge variant={getGradeColor(assessment.grade) as any}>
                        {assessment.grade.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{assessment.weight}x</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {assessment.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(assessment)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(assessment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAssessment ? "Editar Avaliação" : "Nova Avaliação"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da avaliação do aluno
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Aluno *</Label>
                  <Select
                    value={formData.student_id?.toString()}
                    onValueChange={(value) => 
                      setFormData({ ...formData, student_id: parseInt(value) })
                    }
                    disabled={!!editingAssessment}
                  >
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((enrollment) => (
                        <SelectItem 
                          key={enrollment.student.id} 
                          value={enrollment.student.id.toString()}
                        >
                          {enrollment.student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson">Aula *</Label>
                  <Select
                    value={formData.lesson_id?.toString()}
                    onValueChange={(value) => 
                      setFormData({ ...formData, lesson_id: parseInt(value) })
                    }
                    disabled={!!editingAssessment}
                  >
                    <SelectTrigger id="lesson">
                      <SelectValue placeholder="Selecione a aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id.toString()}>
                          {new Date(lesson.date).toLocaleDateString("pt-BR")} - {lesson.content?.substring(0, 30)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prova">Prova</SelectItem>
                      <SelectItem value="Trabalho">Trabalho</SelectItem>
                      <SelectItem value="Participação">Participação</SelectItem>
                      <SelectItem value="Seminário">Seminário</SelectItem>
                      <SelectItem value="Atividade">Atividade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Nota (0-10) *</Label>
                  <Input
                    id="grade"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data da Avaliação *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.assessment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, assessment_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Observações</Label>
                <Textarea
                  id="note"
                  placeholder="Observações sobre a avaliação (opcional)"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowDialog(false)
                  setEditingAssessment(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingAssessment ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
