"use client"

import { useState, useEffect } from "react"
import { assessmentsApi, Assessment, classesApi, Class, studentsApi, Student } from "@/lib/educational-api"
import { Button } from "@/components/ui/button"
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
import { Plus, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      loadAssessments(parseInt(selectedClassId))
    }
  }, [selectedClassId])

  const loadData = async () => {
    try {
      const [classesData, studentsData] = await Promise.all([
        classesApi.list(),
        studentsApi.list()
      ])
      setClasses(classesData)
      setStudents(studentsData)
      if (classesData.length > 0) {
        setSelectedClassId(classesData[0].id.toString())
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAssessments = async (classId: number) => {
    try {
      setLoading(true)
      const data = await assessmentsApi.list(classId)
      setAssessments(data)
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId)
    return student ? student.name : "N/A"
  }

  const calculatePercentage = (grade: number, maxGrade: number) => {
    return ((grade / maxGrade) * 100).toFixed(1)
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 70) return "default"
    if (percentage >= 50) return "secondary"
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
          <h1 className="text-3xl font-bold tracking-tight">Notas e Avaliações</h1>
          <p className="text-muted-foreground">
            Gerencie as avaliações e notas dos alunos
          </p>
        </div>
        <Button disabled={!selectedClassId}>
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
                  <TableHead>Data</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Percentual</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => {
                  const percentage = parseFloat(
                    calculatePercentage(assessment.grade, assessment.max_grade)
                  )
                  return (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {getStudentName(assessment.student_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {assessment.assessment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(assessment.date)}</TableCell>
                      <TableCell>
                        {assessment.grade} / {assessment.max_grade}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getGradeColor(percentage) as any}>
                          {percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {assessment.description || "-"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
