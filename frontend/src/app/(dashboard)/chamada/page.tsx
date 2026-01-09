"use client"

import { useState, useEffect } from "react"
import { classesApi, Class, enrollmentsApi, Enrollment, lessonsApi, attendancesApi } from "@/lib/educational-api"
import { Button } from "@/components/ui/button"
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
import { Calendar, Users, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type AttendanceStatus = "present" | "absent" | "late" | null

export default function AttendancePage() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [students, setStudents] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [attendances, setAttendances] = useState<Record<number, AttendanceStatus>>({})
  const [lessonId, setLessonId] = useState<number | null>(null)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadClassStudents(parseInt(selectedClass))
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

  const loadClassStudents = async (classId: number) => {
    try {
      setLoading(true)
      const data = await enrollmentsApi.getClassStudents(classId)
      // Ordenar alunos alfabeticamente
      const sortedData = data.sort((a, b) => 
        a.student.name.localeCompare(b.student.name, 'pt-BR')
      )
      setStudents(sortedData)
      // Resetar presenças
      setAttendances({})
      setLessonId(null)
    } catch (error) {
      console.error("Erro ao carregar alunos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar alunos da turma",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAttendance = (studentId: number, status: AttendanceStatus) => {
    setAttendances(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }))
  }

  const handleMarkAllPresent = () => {
    const allPresent: Record<number, AttendanceStatus> = {}
    students.forEach(enrollment => {
      allPresent[enrollment.student.id] = "present"
    })
    setAttendances(allPresent)
  }

  const handleSave = async () => {
    if (!selectedClass) return

    const markedCount = Object.keys(attendances).length
    if (markedCount === 0) {
      toast({
        title: "Atenção",
        description: "Marque a presença de pelo menos um aluno",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      // Criar aula primeiro
      const today = new Date().toISOString().split("T")[0]
      const lesson = await lessonsApi.create({
        class_id: parseInt(selectedClass),
        date: today,
        content: "Registro de frequência",
        notes: ""
      })

      // Salvar presenças
      const attendanceData = Object.entries(attendances).map(([studentId, status]) => ({
        lesson_id: lesson.id,
        student_id: parseInt(studentId),
        status: status as 'present' | 'absent' | 'late',
        note: status === "late" ? "Atrasado" : status === "absent" ? "Falta" : undefined
      }))

      await attendancesApi.bulkCreate(attendanceData)

      toast({
        title: "Frequência salva!",
        description: `Presença registrada para ${markedCount} aluno(s)`,
      })

      // Resetar
      setAttendances({})
      setLessonId(lesson.id)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao salvar frequência",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const currentClass = classes.find((c) => c.id.toString() === selectedClass)
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getStatusButton = (studentId: number, status: AttendanceStatus, label: string, icon: any, colorClass: string) => {
    const isActive = attendances[studentId] === status
    const Icon = icon
    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        className={isActive ? colorClass : ""}
        onClick={() => handleAttendance(studentId, status)}
      >
        <Icon className="h-4 w-4 mr-1" />
        {label}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Frequência</h1>
          <p className="text-muted-foreground">
            Registre a presença dos alunos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Frequência</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {today}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : !currentClass ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Você não possui turmas atribuídas
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum aluno matriculado nesta turma
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{currentClass.name}</h3>
                  {currentClass.level && (
                    <p className="text-sm text-muted-foreground">
                      Nível: {currentClass.level}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{students.length} aluno(s)</span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Lista de Alunos</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar Todos Presentes
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg divide-y">
                  {students.map((enrollment, index) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground w-8">
                          {index + 1}
                        </span>
                        <span className="font-medium">{enrollment.student.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {getStatusButton(
                          enrollment.student.id,
                          "present",
                          "Presente",
                          CheckCircle2,
                          "bg-green-600 hover:bg-green-700"
                        )}
                        {getStatusButton(
                          enrollment.student.id,
                          "absent",
                          "Falta",
                          XCircle,
                          "bg-red-600 hover:bg-red-700"
                        )}
                        {getStatusButton(
                          enrollment.student.id,
                          "late",
                          "Atraso",
                          Clock,
                          "bg-orange-600 hover:bg-orange-700"
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setAttendances({})}>
                    Limpar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Frequência"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
