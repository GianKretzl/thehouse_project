"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { classesApi, Class, enrollmentsApi, lessonsApi, assessmentsApi } from "@/lib/educational-api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { 
  Users,
  TrendingUp,
  BookOpen,
  Calendar as CalendarIcon,
  ArrowLeft,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  LayoutDashboard,
  ClipboardList,
  FileText,
  BarChart3,
  Bell,
  X,
  Pencil,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function ClassDetailPage() {
  const params = useParams()
  const classId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()
  const [classData, setClassData] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [withoutAttendance, setWithoutAttendance] = useState(false)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "present" | "absent" | "late">>({})
  const [enrolledStudents, setEnrolledStudents] = useState<Array<{ id: number; name: string }>>([])
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [consultView, setConsultView] = useState<"alunos" | "aulas">("aulas")
  const [registeredLessons, setRegisteredLessons] = useState<any[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [editingAttendances, setEditingAttendances] = useState<Record<string, "present" | "absent" | "late">>({})
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [studentAttendanceMatrix, setStudentAttendanceMatrix] = useState<Record<string, Record<number, string>>>({})
  const [lessonNotes, setLessonNotes] = useState<string>("")
  const [selectedContentLesson, setSelectedContentLesson] = useState<any>(null)
  const [contentText, setContentText] = useState<string>("")
  const [savingContent, setSavingContent] = useState(false)
  const [selectedAssessmentLesson, setSelectedAssessmentLesson] = useState<any>(null)
  const [assessmentType, setAssessmentType] = useState<string>("")
  const [maxGrade, setMaxGrade] = useState<string>("")
  const [assessmentGrades, setAssessmentGrades] = useState<Record<string, string>>({})
  const [savingAssessment, setSavingAssessment] = useState(false)
  const [assessments, setAssessments] = useState<any[]>([])
  const [loadingAssessments, setLoadingAssessments] = useState(false)
  const [assessmentConsultView, setAssessmentConsultView] = useState<"avaliacoes" | "alunos">("avaliacoes")
  const [studentAssessmentMatrix, setStudentAssessmentMatrix] = useState<any[]>([])

  const isTeacher = user?.role === "TEACHER"
  const canEdit = user?.role === "TEACHER"

  // Mock data - em produção viria da API
  const mockStudents = [
    { id: "1", name: "João Silva", attendance: 92, performance: 85, activities: 15 },
    { id: "2", name: "Maria Santos", attendance: 88, performance: 90, activities: 18 },
    { id: "3", name: "Pedro Costa", attendance: 95, performance: 78, activities: 12 },
    { id: "4", name: "Ana Oliveira", attendance: 85, performance: 88, activities: 16 },
    { id: "5", name: "Lucas Souza", attendance: 90, performance: 82, activities: 14 },
  ]

  const currentStudent = mockStudents.find(s => s.id === selectedStudent)

  useEffect(() => {
    loadClassData()
    loadEnrolledStudents()
    loadRegisteredLessons()
    loadAssessments()
  }, [classId])

  const loadClassData = async () => {
    try {
      setLoading(true)
      const data = await classesApi.getById(parseInt(classId))
      setClassData(data)
    } catch (error) {
      console.error("Erro ao carregar turma:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEnrolledStudents = async () => {
    try {
      const enrollments = await enrollmentsApi.getClassStudents(parseInt(classId))
      const students = enrollments
        .filter(enrollment => enrollment.is_active)
        .map(enrollment => ({
          id: enrollment.student_id,
          name: enrollment.student.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      setEnrolledStudents(students)
    } catch (error) {
      console.error("Erro ao carregar alunos:", error)
    }
  }

  const loadRegisteredLessons = async () => {
    try {
      setLoadingLessons(true)
      const lessons = await lessonsApi.list(parseInt(classId))
      
      // Para cada aula, buscar as frequências para contar presentes
      const lessonsWithAttendance = await Promise.all(
        lessons.map(async (lesson) => {
          try {
            const attendances = await lessonsApi.getAttendances(lesson.id)
            
            const presentCount = attendances.filter((att: any) => 
              att.status === 'present' || att.status === 'late'
            ).length
            
            return {
              ...lesson,
              presentCount,
              totalStudents: attendances.length
            }
          } catch (error) {
            console.error(`Erro ao carregar frequências da aula ${lesson.id}:`, error)
            return {
              ...lesson,
              presentCount: 0,
              totalStudents: 0
            }
          }
        })
      )
      
      // Ordenar por data (da menor para a maior)
      lessonsWithAttendance.sort((a, b) => {
        const dateA = a.date.split('-').map(Number)
        const dateB = b.date.split('-').map(Number)
        const timeA = new Date(dateA[0], dateA[1] - 1, dateA[2]).getTime()
        const timeB = new Date(dateB[0], dateB[1] - 1, dateB[2]).getTime()
        return timeA - timeB
      })
      
      setRegisteredLessons(lessonsWithAttendance)
      
      // Criar matriz de frequências aluno x aula
      await loadStudentAttendanceMatrix(lessonsWithAttendance)
    } catch (error) {
      console.error("Erro ao carregar aulas:", error)
    } finally {
      setLoadingLessons(false)
    }
  }

  const loadStudentAttendanceMatrix = async (lessons: any[]) => {
    try {
      const matrix: Record<string, Record<number, string>> = {}
      
      // Para cada aula, buscar frequências e montar a matriz
      for (const lesson of lessons) {
        const attendances = await lessonsApi.getAttendances(lesson.id)
        
        attendances.forEach((att: any) => {
          if (!matrix[att.student_id]) {
            matrix[att.student_id] = {}
          }
          matrix[att.student_id][lesson.id] = att.status
        })
      }
      
      setStudentAttendanceMatrix(matrix)
    } catch (error) {
      console.error("Erro ao carregar matriz de frequências:", error)
    }
  }

  const handleSaveAttendance = async (andGoToContent = false) => {
    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data para a aula",
        variant: "destructive"
      })
      return
    }

    // Verifica se algum aluno tem status registrado
    const hasRecords = Object.keys(attendanceRecords).length > 0
    if (!withoutAttendance && !hasRecords) {
      toast({
        title: "Erro",
        description: "Registre a frequência dos alunos ou marque 'Sem Frequência'",
        variant: "destructive"
      })
      return
    }

    try {
      setSavingAttendance(true)

      // Formata os dados para enviar à API
      const attendanceData = enrolledStudents.map(student => ({
        student_id: student.id,
        status: attendanceRecords[student.id.toString()] || "absent"
      }))

      await lessonsApi.bulkAttendance({
        class_id: parseInt(classId),
        date: format(selectedDate, "yyyy-MM-dd"),
        attendances: attendanceData,
        without_attendance: withoutAttendance,
        notes: lessonNotes || undefined
      })

      toast({
        title: "Sucesso",
        description: "Frequência salva com sucesso!"
      })
      
      // Recarrega a lista de aulas
      await loadRegisteredLessons()
      
      // Limpa o formulário
      setShowAttendanceForm(false)
      setAttendanceRecords({})
      setSelectedDate(undefined)
      setWithoutAttendance(false)
      setLessonNotes("")

      // Se deve ir para conteúdo, muda a aba
      if (andGoToContent) {
        setActiveTab("conteudo")
      }
    } catch (error: any) {
      console.error("Erro ao salvar frequência:", error)
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a frequência",
        variant: "destructive"
      })
    } finally {
      setSavingAttendance(false)
    }
  }

  const getWeekdayName = (weekday: number) => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    return days[weekday] || '-'
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '-'
    return timeString.substring(0, 5)
  }

  const handleSaveContent = async () => {
    if (!selectedContentLesson || !contentText.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma aula e preencha o conteúdo",
        variant: "destructive"
      })
      return
    }

    try {
      setSavingContent(true)
      
      await lessonsApi.update(selectedContentLesson.id, {
        content: contentText
      })

      toast({
        title: "Sucesso",
        description: "Conteúdo salvo com sucesso!"
      })
      
      // Recarrega as aulas para atualizar a lista
      await loadRegisteredLessons()
      
      // Limpa o formulário
      setSelectedContentLesson(null)
      setContentText("")
    } catch (error: any) {
      console.error("Erro ao salvar conteúdo:", error)
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o conteúdo",
        variant: "destructive"
      })
    } finally {
      setSavingContent(false)
    }
  }

  const handleSaveAssessment = async () => {
    if (!selectedAssessmentLesson || !assessmentType.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma aula e informe o tipo de avaliação",
        variant: "destructive"
      })
      return
    }

    const maxGradeNum = parseFloat(maxGrade)
    if (isNaN(maxGradeNum) || maxGradeNum <= 0 || maxGradeNum > 10) {
      toast({
        title: "Erro",
        description: "Nota máxima deve estar entre 0.1 e 10.0",
        variant: "destructive"
      })
      return
    }

    // Verificar se há pelo menos uma nota preenchida
    const hasGrades = Object.values(assessmentGrades).some(g => g.trim() !== "")
    if (!hasGrades) {
      toast({
        title: "Erro",
        description: "Informe pelo menos uma nota",
        variant: "destructive"
      })
      return
    }

    try {
      setSavingAssessment(true)
      
      const today = new Date().toISOString().split('T')[0]
      
      // Salvar avaliações para cada aluno que tem nota
      for (const [studentId, gradeStr] of Object.entries(assessmentGrades)) {
        if (!gradeStr.trim()) continue
        
        let grade = parseFloat(gradeStr.replace(',', '.'))
        if (isNaN(grade)) continue
        
        // Validação: converte 92 para 9.2
        if (grade > 10) {
          grade = grade / 10
        }
        
        // Validação: não pode exceder max_grade
        if (grade > maxGradeNum) {
          toast({
            title: "Erro",
            description: `Nota ${grade} excede a nota máxima ${maxGradeNum}`,
            variant: "destructive"
          })
          setSavingAssessment(false)
          return
        }
        
        if (grade > 10.0) {
          toast({
            title: "Erro",
            description: "Nota não pode exceder 10.0",
            variant: "destructive"
          })
          setSavingAssessment(false)
          return
        }
        
        await assessmentsApi.create({
          lesson_id: selectedAssessmentLesson.id,
          student_id: parseInt(studentId),
          type: assessmentType,
          grade: grade,
          max_grade: maxGradeNum,
          weight: 1.0,
          assessment_date: today
        })
      }

      toast({
        title: "Sucesso",
        description: "Avaliações salvas com sucesso!"
      })
      
      // Recarrega avaliações
      await loadAssessments()
      
      // Limpa o formulário
      setSelectedAssessmentLesson(null)
      setAssessmentType("")
      setMaxGrade("")
      setAssessmentGrades({})
    } catch (error: any) {
      console.error("Erro ao salvar avaliações:", error)
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as avaliações",
        variant: "destructive"
      })
    } finally {
      setSavingAssessment(false)
    }
  }

  const loadAssessments = async () => {
    try {
      setLoadingAssessments(true)
      const data = await assessmentsApi.list(parseInt(classId))
      setAssessments(data)
      
      // Construir matriz aluno x avaliação
      const matrix = enrolledStudents.map(student => {
        const studentAssessments = data.filter((a: any) => a.student_id === student.id)
        return {
          student,
          assessments: studentAssessments
        }
      })
      setStudentAssessmentMatrix(matrix)
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
    } finally {
      setLoadingAssessments(false)
    }
  }

  const parseLocalDate = (dateString: string) => {
    // Converte string "YYYY-MM-DD" para Date local (sem conversão de timezone)
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const handleEditLesson = async (lesson: any) => {
    try {
      setLoadingEdit(true)
      // Buscar frequências dessa aula
      const attendances = await lessonsApi.getAttendances(lesson.id)
      
      // Montar objeto com status de cada aluno
      const attendanceMap: Record<string, "present" | "absent" | "late"> = {}
      attendances.forEach((att: any) => {
        attendanceMap[att.student_id.toString()] = att.status
      })
      
      setEditingAttendances(attendanceMap)
      setEditingLesson(lesson)
    } catch (error) {
      console.error("Erro ao carregar frequências:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as frequências",
        variant: "destructive"
      })
    } finally {
      setLoadingEdit(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingLesson) return

    try {
      setLoadingEdit(true)

      // Formata os dados para enviar à API
      const attendanceData = enrolledStudents.map(student => ({
        student_id: student.id,
        status: editingAttendances[student.id.toString()] || "absent"
      }))

      await lessonsApi.bulkAttendance({
        class_id: parseInt(classId),
        date: editingLesson.date,
        attendances: attendanceData,
        without_attendance: false
      })

      toast({
        title: "Sucesso",
        description: "Frequência atualizada com sucesso!"
      })
      
      // Recarrega a lista de aulas
      await loadRegisteredLessons()
      
      // Fecha o formulário de edição
      setEditingLesson(null)
      setEditingAttendances({})
    } catch (error: any) {
      console.error("Erro ao atualizar frequência:", error)
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a frequência",
        variant: "destructive"
      })
    } finally {
      setLoadingEdit(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingLesson(null)
    setEditingAttendances({})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Carregando...</div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Turma não encontrada</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/turmas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {classData.level && <Badge variant="outline">{classData.level}</Badge>}
              {classData.is_active ? (
                <Badge variant="default">Ativa</Badge>
              ) : (
                <Badge variant="secondary">Inativa</Badge>
              )}
            </div>
          </div>
        </div>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecionar aluno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visão Geral da Turma</SelectItem>
            {mockStudents.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="chamada">
            <ClipboardList className="h-4 w-4 mr-2" />
            Frequência
          </TabsTrigger>
          <TabsTrigger value="conteudo">
            <BookOpen className="h-4 w-4 mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="notas">
            <FileText className="h-4 w-4 mr-2" />
            Avaliação
          </TabsTrigger>
          <TabsTrigger value="planejamento">
            <BarChart3 className="h-4 w-4 mr-2" />
            Planejamento
          </TabsTrigger>
          <TabsTrigger value="avisos">
            <Bell className="h-4 w-4 mr-2" />
            Avisos
          </TabsTrigger>
          <TabsTrigger value="agenda">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Agenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          {/* Info Cards - Turma */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professor</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.teacher_name || "Sem professor"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Matriculados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.current_students || 0} / {classData.max_capacity}
            </div>
            <Progress 
              value={((classData.current_students || 0) / classData.max_capacity) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {classData.schedules && classData.schedules.length > 0
                ? `${getWeekdayName(classData.schedules[0].weekday)}`
                : "Sem horário"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {classData.schedules && classData.schedules.length > 0
                ? `${formatTime(classData.schedules[0].start_time)} - ${formatTime(classData.schedules[0].end_time)}`
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas Realizadas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 / 40</div>
            <p className="text-xs text-muted-foreground mt-1">
              60% do programa
            </p>
          </CardContent>
        </Card>
          </div>

          {selectedStudent === "all" ? (
            // Dashboard da Turma
            <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequência Geral</CardTitle>
              <CardDescription>Média de presença da turma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Presentes</span>
                </div>
                <span className="text-2xl font-bold">90%</span>
              </div>
              <Progress value={90} className="h-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Última aula: 4/5 alunos presentes</span>
                <span>80%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho Médio</CardTitle>
              <CardDescription>Performance geral nas avaliações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Nota Média</span>
                </div>
                <span className="text-2xl font-bold">8.5</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Máxima</div>
                  <div className="font-semibold">9.5</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mínima</div>
                  <div className="font-semibold">7.0</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mediana</div>
                  <div className="font-semibold">8.5</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas atividades registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Conteúdo: Unit 5</div>
                      <div className="text-xs text-muted-foreground">Há 2 dias</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Frequência registrada</div>
                      <div className="text-xs text-muted-foreground">Há 2 dias</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Avaliação Unit 4</div>
                      <div className="text-xs text-muted-foreground">Há 1 semana</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas e Pendências</CardTitle>
              <CardDescription>Itens que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">2 alunos com baixa frequência</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Frequência abaixo de 75%
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">1 aluno com nota abaixo da média</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Necessita atenção especial
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          ) : currentStudent ? (
            // Dashboard do Aluno Específico
            <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequência de {currentStudent.name}</CardTitle>
              <CardDescription>Presenças registradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Taxa de Presença</span>
                </div>
                <span className="text-2xl font-bold">{currentStudent.attendance}%</span>
              </div>
              <Progress value={currentStudent.attendance} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Presenças</div>
                  <div className="font-semibold text-lg">22</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Faltas</div>
                  <div className="font-semibold text-lg">2</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho</CardTitle>
              <CardDescription>Avaliações e desempenho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Nota Média</span>
                </div>
                <span className="text-2xl font-bold">{(currentStudent.performance / 10).toFixed(1)}</span>
              </div>
              <Progress value={currentStudent.performance} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Última</div>
                  <div className="font-semibold">8.5</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Maior</div>
                  <div className="font-semibold">9.0</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Menor</div>
                  <div className="font-semibold">7.5</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Entregues</CardTitle>
              <CardDescription>Participação nas atividades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Total de Atividades</span>
                </div>
                <span className="text-2xl font-bold">{currentStudent.activities}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entregues no prazo</span>
                  <span className="font-semibold">13</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entregues com atraso</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Não entregues</span>
                  <span className="font-semibold text-red-500">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso no Curso</CardTitle>
              <CardDescription>Acompanhamento de conteúdo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Units Completadas</span>
                    <span className="font-semibold">4/6</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Vocabulário</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gramática</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="chamada" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cadastrar Frequência</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">(*) Obrigatório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data da Aula: *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Clique aqui para selecionar a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          // Não permite datas futuras
                          if (date > new Date() || date < new Date("1900-01-01")) {
                            return true
                          }
                          
                          // Verifica se a turma tem horários configurados
                          if (!classData?.schedules || classData.schedules.length === 0) {
                            return false // Se não tem horários, permite qualquer dia
                          }
                          
                          // Obtém o dia da semana da data (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
                          const dayOfWeek = date.getDay()
                          
                          // Converte para o formato do backend (0 = Segunda, 1 = Terça, ..., 6 = Domingo)
                          // JavaScript: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
                          // Backend:    0=Seg, 1=Ter, 2=Qua, 3=Qui, 4=Sex, 5=Sáb, 6=Dom
                          const backendWeekday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                          
                          // Verifica se o dia está nos horários da turma
                          const hasSchedule = classData.schedules.some(
                            schedule => schedule.weekday === backendWeekday
                          )
                          
                          return !hasSchedule // Desabilita se NÃO tiver horário neste dia
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={withoutAttendance}
                      onChange={(e) => setWithoutAttendance(e.target.checked)}
                    />
                    <span className="text-sm">Sem Frequência</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedDate(undefined)
                    setWithoutAttendance(false)
                  }}
                >
                  Limpar
                </Button>
                {selectedDate && (
                  <Button onClick={() => setShowAttendanceForm(true)}>
                    Avançar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {showAttendanceForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cadastrar Frequência</CardTitle>
                    <CardDescription>
                      Data: {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ""}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setShowAttendanceForm(false)
                      setAttendanceRecords({})
                      setLessonNotes("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrolledStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{student.name}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={attendanceRecords[student.id.toString()] === "present" ? "default" : "outline"}
                          onClick={() => setAttendanceRecords(prev => ({
                            ...prev,
                            [student.id.toString()]: prev[student.id.toString()] === "present" ? (undefined as any) : "present"
                          }))}
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Presente
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceRecords[student.id.toString()] === "absent" ? "destructive" : "outline"}
                          onClick={() => setAttendanceRecords(prev => ({
                            ...prev,
                            [student.id.toString()]: prev[student.id.toString()] === "absent" ? (undefined as any) : "absent"
                          }))}
                          className="gap-1"
                        >
                          <X className="h-4 w-4" />
                          Faltou
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceRecords[student.id.toString()] === "late" ? "secondary" : "outline"}
                          onClick={() => setAttendanceRecords(prev => ({
                            ...prev,
                            [student.id.toString()]: prev[student.id.toString()] === "late" ? (undefined as any) : "late"
                          }))}
                          className={cn(
                            "gap-1",
                            attendanceRecords[student.id.toString()] === "late" && "bg-yellow-500 hover:bg-yellow-600 text-white"
                          )}
                        >
                          <Clock className="h-4 w-4" />
                          Atrasado
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium">Observações:</label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md resize-y"
                    placeholder="Adicione observações sobre a aula (opcional)"
                    value={lessonNotes}
                    onChange={(e) => setLessonNotes(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    disabled={savingAttendance}
                    onClick={() => {
                      setShowAttendanceForm(false)
                      setAttendanceRecords({})
                      setSelectedDate(undefined)
                      setWithoutAttendance(false)
                      setLessonNotes("")
                    }}
                  >
                    Limpar
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={savingAttendance}
                    onClick={() => handleSaveAttendance(true)}
                  >
                    {savingAttendance ? "Salvando..." : "Salvar e Incluir Conteúdo"}
                  </Button>
                  <Button
                    disabled={savingAttendance}
                    onClick={() => handleSaveAttendance(false)}
                  >
                    {savingAttendance ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <span className="font-medium">Consultar:</span>
                <div className="flex gap-2">
                  <Button 
                    variant={consultView === "alunos" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setConsultView("alunos")}
                  >
                    Aluno
                  </Button>
                  <Button 
                    variant={consultView === "aulas" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setConsultView("aulas")}
                  >
                    Aulas
                  </Button>
                </div>
              </div>
              
              {loadingLessons ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : editingLesson ? (
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Editar Frequência</CardTitle>
                        <CardDescription>
                          Data: {format(parseLocalDate(editingLesson.date), "dd/MM/yyyy", { locale: ptBR })}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingEdit ? (
                      <div className="text-center py-8">Carregando...</div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {enrolledStudents.map((student) => (
                            <div 
                              key={student.id} 
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="font-medium">{student.name}</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={editingAttendances[student.id.toString()] === "present" ? "default" : "outline"}
                                  onClick={() => setEditingAttendances(prev => ({
                                    ...prev,
                                    [student.id.toString()]: prev[student.id.toString()] === "present" ? (undefined as any) : "present"
                                  }))}
                                  className="gap-1"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Presente
                                </Button>
                                <Button
                                  size="sm"
                                  variant={editingAttendances[student.id.toString()] === "absent" ? "destructive" : "outline"}
                                  onClick={() => setEditingAttendances(prev => ({
                                    ...prev,
                                    [student.id.toString()]: prev[student.id.toString()] === "absent" ? (undefined as any) : "absent"
                                  }))}
                                  className="gap-1"
                                >
                                  <X className="h-4 w-4" />
                                  Faltou
                                </Button>
                                <Button
                                  size="sm"
                                  variant={editingAttendances[student.id.toString()] === "late" ? "secondary" : "outline"}
                                  onClick={() => setEditingAttendances(prev => ({
                                    ...prev,
                                    [student.id.toString()]: prev[student.id.toString()] === "late" ? (undefined as any) : "late"
                                  }))}
                                  className={cn(
                                    "gap-1",
                                    editingAttendances[student.id.toString()] === "late" && "bg-yellow-500 hover:bg-yellow-600 text-white"
                                  )}
                                >
                                  <Clock className="h-4 w-4" />
                                  Atrasado
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                          <Button 
                            variant="outline"
                            disabled={loadingEdit}
                            onClick={handleCancelEdit}
                          >
                            Voltar
                          </Button>
                          <Button
                            disabled={loadingEdit}
                            onClick={handleSaveEdit}
                          >
                            {loadingEdit ? "Salvando..." : "Alterar"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : consultView === "aulas" ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="h-12 px-4 text-left align-middle font-medium">Data</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Presentes</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Observações</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Lançamento em</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredLessons.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Nenhuma frequência registrada ainda
                          </td>
                        </tr>
                      ) : (
                        registeredLessons.map((lesson) => (
                          <tr key={lesson.id} className="border-t">
                            <td className="p-4">
                              {format(parseLocalDate(lesson.date), "dd/MM/yyyy", { locale: ptBR })}
                            </td>
                            <td className="p-4">{lesson.presentCount}</td>
                            <td className="p-4">{lesson.notes || "-"}</td>
                            <td className="p-4">
                              {format(new Date(lesson.created_at), "dd/MM/yyyy, HH:mm:ss", { locale: ptBR })}
                            </td>
                            <td className="p-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="sticky left-0 z-10 bg-muted/50 border px-3 py-2 text-left text-sm font-medium w-12">Nº</th>
                        <th className="sticky left-12 z-10 bg-muted/50 border px-3 py-2 text-left text-sm font-medium min-w-[250px]">Nome</th>
                        {registeredLessons.map((lesson) => (
                          <th key={lesson.id} className="border px-2 py-2 text-center text-sm font-medium min-w-[70px]">
                            <div className="flex flex-col items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <ClipboardList className="h-3 w-3" />
                              </Button>
                              <div className="text-xs">
                                {format(parseLocalDate(lesson.date), "dd", { locale: ptBR })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(parseLocalDate(lesson.date), "MMM.", { locale: ptBR })}
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="border px-2 py-2 text-center text-sm font-medium min-w-[80px] bg-muted/50">Total de Faltas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.length === 0 ? (
                        <tr>
                          <td colSpan={3 + registeredLessons.length} className="p-8 text-center text-muted-foreground">
                            Nenhum aluno matriculado
                          </td>
                        </tr>
                      ) : (
                        enrolledStudents.map((student, index) => (
                          <tr key={student.id} className="hover:bg-muted/30">
                            <td className="sticky left-0 z-10 bg-background border px-3 py-2 text-sm">{index + 1}</td>
                            <td className="sticky left-12 z-10 bg-background border px-3 py-2 text-sm font-medium">{student.name}</td>
                            {registeredLessons.map((lesson) => {
                              const status = studentAttendanceMatrix[student.id]?.[lesson.id]
                              
                              let bgColor = "bg-gray-200"
                              let textColor = "text-gray-600"
                              let label = "-"
                              
                              if (status === "present") {
                                bgColor = "bg-cyan-500"
                                textColor = "text-white"
                                label = "C"
                              } else if (status === "absent") {
                                bgColor = "bg-red-500"
                                textColor = "text-white"
                                label = "F"
                              } else if (status === "late") {
                                bgColor = "bg-yellow-500"
                                textColor = "text-white"
                                label = "A"
                              }
                              
                              return (
                                <td key={lesson.id} className="border px-2 py-2 text-center">
                                  <div className={`w-10 h-10 mx-auto rounded flex items-center justify-center font-bold text-sm ${bgColor} ${textColor}`}>
                                    {label}
                                  </div>
                                </td>
                              )
                            })}
                            <td className="border px-3 py-2 text-center text-sm font-bold">
                              {(() => {
                                const absences = registeredLessons.filter(lesson => 
                                  studentAttendanceMatrix[student.id]?.[lesson.id] === "absent"
                                ).length
                                return absences
                              })()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="conteudo" className="mt-6">
          {selectedContentLesson ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Editar Conteúdo</CardTitle>
                    <CardDescription>
                      Data: {format(parseLocalDate(selectedContentLesson.date), "dd/MM/yyyy", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedContentLesson(null)
                      setContentText("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Data da Aula:</span>
                      <span>{format(parseLocalDate(selectedContentLesson.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Presentes:</span>
                      <span>{selectedContentLesson.presentCount}</span>
                    </div>
                    {selectedContentLesson.notes && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="font-medium">Observações da Frequência:</span>
                        <p className="text-muted-foreground mt-1">{selectedContentLesson.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conteúdo da Aula: *</label>
                    <textarea
                      className="w-full min-h-[200px] p-3 border rounded-md resize-y"
                      placeholder="Descreva o conteúdo ministrado na aula..."
                      value={contentText}
                      onChange={(e) => setContentText(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      disabled={savingContent}
                      onClick={() => {
                        setSelectedContentLesson(null)
                        setContentText("")
                      }}
                    >
                      Voltar
                    </Button>
                    <Button
                      disabled={savingContent}
                      onClick={handleSaveContent}
                    >
                      {savingContent ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Conteúdos Registrados</CardTitle>
                <CardDescription>
                  Visualize e gerencie os conteúdos das aulas com frequência registrada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registeredLessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma frequência registrada ainda.</p>
                    <p className="text-sm mt-2">Registre a frequência na aba "Frequência" antes de lançar conteúdo.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="h-12 px-4 text-left align-middle font-medium w-[120px]">Data</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Tipo da Aula / Planejamento</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Específico / Observações</th>
                          <th className="h-12 px-4 text-center align-middle font-medium w-[100px]">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredLessons.map((lesson) => (
                          <tr key={lesson.id} className="border-t hover:bg-muted/30">
                            <td className="p-4 align-top">
                              <div className="font-medium">
                                {format(parseLocalDate(lesson.date), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              <div className="text-sm text-muted-foreground italic">
                                -
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              {lesson.content ? (
                                <>
                                  <div className="text-sm text-muted-foreground whitespace-pre-wrap max-w-2xl">
                                    {lesson.content}
                                  </div>
                                  {lesson.notes && (
                                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                      <span className="font-medium">Obs. Frequência:</span> {lesson.notes}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-muted-foreground italic">
                                  Sem conteúdo registrado
                                </div>
                              )}
                            </td>
                            <td className="p-4 align-top">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Editar"
                                  onClick={() => {
                                    setSelectedContentLesson(lesson)
                                    setContentText(lesson.content || "")
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notas" className="mt-6">
          {selectedAssessmentLesson ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lançar Avaliação</CardTitle>
                    <CardDescription>
                      Informe as notas da avaliação para os alunos
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedAssessmentLesson(null)
                      setAssessmentType("")
                      setMaxGrade("")
                      setAssessmentGrades({})
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Data da Aula:</span>
                      <span>{format(parseLocalDate(selectedAssessmentLesson.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Presentes:</span>
                      <span>{selectedAssessmentLesson.presentCount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Avaliação: *</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Ex: Prova, Trabalho, Atividade..."
                        value={assessmentType}
                        onChange={(e) => setAssessmentType(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nota: *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 p-2 border rounded-md"
                          value={maxGrade}
                          onChange={(e) => setMaxGrade(e.target.value)}
                        />
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {maxGrade && !isNaN(parseFloat(maxGrade.replace(',', '.'))) ? (
                            <span>Disponível: {(10 - parseFloat(maxGrade.replace(',', '.'))).toFixed(1)} pts</span>
                          ) : (
                            <span>Disponível: 10.0 pts</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notas dos Alunos:</label>
                    <div className="border rounded-md p-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {enrolledStudents.map((student) => {
                        const gradeStr = assessmentGrades[student.id] || ""
                        let grade = gradeStr.trim() ? parseFloat(gradeStr.replace(',', '.')) : null
                        
                        // Converte 92 para 9.2
                        if (grade && grade > 10) {
                          grade = grade / 10
                        }
                        
                        const maxGradeNum = maxGrade ? parseFloat(maxGrade.replace(',', '.')) : 10
                        const hasError = grade !== null && !isNaN(grade) && (grade > maxGradeNum || grade > 10)
                        
                        return (
                          <div key={student.id} className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium flex-1">{student.name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className={cn(
                                  "w-24 p-2 border rounded-md text-center",
                                  hasError && "border-red-500 bg-red-50 focus:ring-red-500"
                                )}
                                placeholder="0.0"
                                value={assessmentGrades[student.id] || ""}
                                onChange={(e) => setAssessmentGrades({
                                  ...assessmentGrades,
                                  [student.id]: e.target.value
                                })}
                              />
                              {hasError && (
                                <span className="text-xs text-red-500 whitespace-nowrap">
                                  Nota maior que a máxima
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      * Digite a nota. Ex: 92 será convertido para 9.2 automaticamente
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      disabled={savingAssessment}
                      onClick={() => {
                        setSelectedAssessmentLesson(null)
                        setAssessmentType("")
                        setMaxGrade("")
                        setAssessmentGrades({})
                      }}
                    >
                      Voltar
                    </Button>
                    <Button
                      disabled={savingAssessment}
                      onClick={handleSaveAssessment}
                    >
                      {savingAssessment ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
                <CardDescription>
                  Registre e acompanhe as avaliações dos alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAssessments ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando avaliações...
                  </div>
                ) : registeredLessons.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nenhuma aula registrada ainda. Registre a frequência primeiro.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 border-b">
                      <button
                        className={cn(
                          "px-4 py-2 font-medium text-sm transition-colors",
                          assessmentConsultView === "avaliacoes"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setAssessmentConsultView("avaliacoes")}
                      >
                        Avaliações
                      </button>
                      <button
                        className={cn(
                          "px-4 py-2 font-medium text-sm transition-colors",
                          assessmentConsultView === "alunos"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setAssessmentConsultView("alunos")}
                      >
                        Alunos
                      </button>
                    </div>

                    {assessmentConsultView === "avaliacoes" ? (
                      <div className="rounded-md border">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="h-12 px-4 text-left align-middle font-medium">Avaliação (AV) / Recuperação (R)</th>
                              <th className="h-12 px-4 text-left align-middle font-medium w-[120px]">Data</th>
                              <th className="h-12 px-4 text-left align-middle font-medium w-[180px]">Lançamento em</th>
                              <th className="h-12 px-4 text-center align-middle font-medium w-[100px]">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assessments.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                  Nenhuma avaliação lançada ainda
                                </td>
                              </tr>
                            ) : (
                              // Agrupar por lesson_id + tipo para mostrar uma linha por avaliação
                              Array.from(new Set(assessments.map(a => `${a.lesson_id}-${a.type}-${a.max_grade}`))).map(key => {
                                const [lessonId, type] = key.split('-')
                                const assessmentGroup = assessments.filter(a => 
                                  a.lesson_id === parseInt(lessonId) && a.type === type
                                )
                                const firstAssessment = assessmentGroup[0]
                                const lesson = registeredLessons.find(l => l.id === parseInt(lessonId))
                                
                                return (
                                  <tr key={key} className="border-t hover:bg-muted/30">
                                    <td className="p-4">
                                      <span className="font-medium">{type}</span>
                                      <span className="text-muted-foreground ml-2">({firstAssessment.max_grade})</span>
                                    </td>
                                    <td className="p-4">
                                      {lesson ? format(parseLocalDate(lesson.date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                      {firstAssessment.created_at 
                                        ? format(new Date(firstAssessment.created_at), "dd/MM/yyyy, HH:mm:ss", { locale: ptBR })
                                        : '-'
                                      }
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center justify-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          title="Editar"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          title="Excluir"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="h-12 px-4 text-left align-middle font-medium sticky left-0 bg-muted/50 z-10 min-w-[200px]">Aluno</th>
                              {Array.from(new Set(assessments.map(a => `${a.type}-${a.max_grade}`))).map(key => {
                                const [type, maxGrade] = key.split('-')
                                return (
                                  <th key={key} className="h-12 px-4 text-center align-middle font-medium min-w-[100px]">
                                    {type}
                                    <div className="text-xs font-normal text-muted-foreground">({maxGrade})</div>
                                  </th>
                                )
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {studentAssessmentMatrix.length === 0 ? (
                              <tr>
                                <td colSpan={100} className="p-8 text-center text-muted-foreground">
                                  Nenhum aluno matriculado
                                </td>
                              </tr>
                            ) : (
                              studentAssessmentMatrix.map((item) => (
                                <tr key={item.student.id} className="border-t hover:bg-muted/30">
                                  <td className="p-4 font-medium sticky left-0 bg-background z-10">
                                    {item.student.name}
                                  </td>
                                  {Array.from(new Set(assessments.map(a => `${a.type}-${a.max_grade}`))).map(key => {
                                    const [type, maxGrade] = key.split('-')
                                    const studentAssessment = item.assessments.find(
                                      (a: any) => a.type === type && a.max_grade === parseFloat(maxGrade)
                                    )
                                    
                                    return (
                                      <td key={key} className="p-4 text-center">
                                        {studentAssessment ? (
                                          <span className="font-medium">{studentAssessment.grade.toFixed(1)}</span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          if (registeredLessons.length > 0) {
                            setSelectedAssessmentLesson(registeredLessons[0])
                            setAssessmentGrades({})
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Lançar Nova Avaliação
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="planejamento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Planejamento Pedagógico</CardTitle>
              <CardDescription>
                {canEdit 
                  ? "Organize o planejamento pedagógico desta turma"
                  : "Visualize o planejamento pedagógico desta turma"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {canEdit 
                  ? "Crie o planejamento pedagógico para esta turma"
                  : "Visualize o planejamento pedagógico desta turma"}
              </p>
              {canEdit && (
                <Button>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Criar Planejamento
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avisos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Avisos da Turma</CardTitle>
              <CardDescription>
                Comunicados e avisos específicos desta turma
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhum aviso publicado ainda
              </p>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Criar Aviso
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agenda da Turma</CardTitle>
              <CardDescription>
                Calendário de eventos e atividades desta turma
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Calendário em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
