"use client"

import { useState, useEffect } from "react"
import { lessonsApi, Lesson, classesApi, Class } from "@/lib/educational-api"
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
import { Plus, BookOpen, Calendar } from "lucide-react"

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      loadLessons(parseInt(selectedClassId))
    }
  }, [selectedClassId])

  const loadClasses = async () => {
    try {
      const data = await classesApi.list()
      setClasses(data)
      if (data.length > 0) {
        setSelectedClassId(data[0].id.toString())
      }
    } catch (error) {
      console.error("Erro ao carregar turmas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async (classId: number) => {
    try {
      setLoading(true)
      const data = await lessonsApi.list(classId)
      setLessons(data)
    } catch (error) {
      console.error("Erro ao carregar aulas:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const selectedClass = classes.find(c => c.id.toString() === selectedClassId)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aulas</h1>
          <p className="text-muted-foreground">
            Gerencie as aulas e conteúdos ministrados
          </p>
        </div>
        <Button disabled={!selectedClassId}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Aulas</CardTitle>
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
            <div className="text-center py-8">Carregando aulas...</div>
          ) : !selectedClassId ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecione uma turma para ver as aulas
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma aula registrada</h3>
              <p className="text-sm text-muted-foreground">
                Comece criando a primeira aula para esta turma
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatDate(lesson.date)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {lesson.content && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Conteúdo</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.content}
                        </p>
                      </div>
                    )}
                    {lesson.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Observações</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.notes}
                        </p>
                      </div>
                    )}
                    {!lesson.content && !lesson.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Sem detalhes registrados
                      </p>
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
