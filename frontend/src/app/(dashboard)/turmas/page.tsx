"use client"

import { useState, useEffect, useMemo } from "react"
import { classesApi, Class, teachersApi, Teacher } from "@/lib/educational-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ClassDialog } from "@/components/dialogs/class-dialog"
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function ClassesPage() {
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Verifica se o usuário é professor (memoizado para evitar recalculos)
  const isTeacher = useMemo(() => user?.role === "TEACHER", [user?.role])

  useEffect(() => {
    // Só carrega dados quando o usuário estiver carregado
    if (!authLoading && user) {
      loadData()
    }
  }, [authLoading, user])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log("[Turmas] Carregando turmas para usuário:", user?.name, "Role:", user?.role)
      
      // Professores não precisam carregar lista de teachers
      if (isTeacher) {
        const classesData = await classesApi.list()
        console.log("[Turmas] Turmas carregadas:", classesData.length)
        setClasses(classesData)
      } else {
        const [classesData, teachersData] = await Promise.all([
          classesApi.list(),
          teachersApi.list()
        ])
        console.log("[Turmas] Turmas carregadas:", classesData.length)
        setClasses(classesData)
        setTeachers(teachersData)
      }
    } catch (error) {
      console.error("[Turmas] Erro ao carregar dados:", error)
      toast({
        title: "Erro ao carregar turmas",
        description: "Não foi possível carregar as turmas. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getWeekdayName = (weekday: number) => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    return days[weekday] || '-'
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '-'
    // timeString vem como "HH:MM:SS"
    return timeString.substring(0, 5) // Retorna "HH:MM"
  }

  const getScheduleInfo = (schedules: any[] | undefined) => {
    if (!schedules || schedules.length === 0) return 'Sem horário definido'
    const schedule = schedules[0] // Pega o primeiro horário
    return `${getWeekdayName(schedule.weekday)} às ${formatTime(schedule.start_time)}`
  }

  const filteredClasses = useMemo(() => {
    return classes.filter(classItem =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.level?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [classes, searchTerm])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedClass(undefined)
    setDialogOpen(true)
  }

  const handleDeleteClick = (classItem: Class) => {
    setSelectedClass(classItem)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedClass) return
    setDeleteLoading(true)
    try {
      await classesApi.delete(selectedClass.id)
      toast({
        title: "Turma removida!",
        description: "A turma foi removida com sucesso.",
      })
      loadData()
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao remover turma",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isTeacher ? "Minhas Turmas" : "Turmas"}
            </h1>
            <p className="text-muted-foreground">
              {isTeacher 
                ? "Visualize as turmas atribuídas a você" 
                : "Gerencie as turmas da instituição"}
            </p>
          </div>
          {!isTeacher && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Turma
            </Button>
          )}
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Turmas</CardTitle>
          <CardDescription>
            Total de {classes.length} turmas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou nível..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {authLoading || loading ? (
            <div className="text-center py-8">Carregando turmas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  {!isTeacher && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isTeacher ? 6 : 7} className="text-center py-8">
                      {searchTerm
                        ? "Nenhuma turma encontrada"
                        : isTeacher 
                          ? "Você ainda não tem turmas atribuídas" 
                          : "Nenhuma turma cadastrada"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">
                        {classItem.name}
                      </TableCell>
                      <TableCell>
                        {classItem.level ? (
                          <Badge variant="outline">{classItem.level}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{classItem.teacher_name || "Sem professor"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {classItem.max_capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getScheduleInfo(classItem.schedules)}
                      </TableCell>
                      <TableCell>
                        {classItem.is_active ? (
                          <Badge variant="default">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </TableCell>
                      {!isTeacher && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(classItem)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(classItem)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>

      <ClassDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classItem={selectedClass}
        onSuccess={loadData}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Excluir Turma"
        description={`Tem certeza que deseja excluir a turma "${selectedClass?.name}"? Esta ação não pode ser desfeita.`}
      />
    </>
  )
}
