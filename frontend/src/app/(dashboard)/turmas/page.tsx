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
import { Plus, Search, Pencil, Trash2, Users, LayoutGrid, List, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ClassDialog } from "@/components/dialogs/class-dialog"
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getClassCategory, getAgeGroupBadgeClass } from "@/lib/class-categories"

type ViewMode = 'list' | 'grid'

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
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  
  // Verifica se o usuário é professor (memoizado para evitar recalculos)
  const isTeacher = useMemo(() => user?.role === "TEACHER", [user?.role])

  // Carregar modo de visualização do localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('turmas_view_mode') as ViewMode
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  // Salvar modo de visualização no localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('turmas_view_mode', mode)
  }

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

  const handleAccess = (classItem: Class) => {
    // Redirecionar para página de detalhes da turma
    window.location.href = `/turmas/${classItem.id}`
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
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleViewModeChange('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleViewModeChange('grid')}
                className="rounded-l-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            {!isTeacher && (
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            )}
          </div>
        </div>

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
        ) : viewMode === 'list' ? (
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                          (() => {
                            const category = getClassCategory(classItem.level)
                            return category ? (
                              <div className="flex flex-col gap-1">
                                <Badge 
                                  className={`${getAgeGroupBadgeClass(category.ageGroup)} border font-semibold`}
                                >
                                  {category.ageGroup}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">
                                  {category.level}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline">{classItem.level}</Badge>
                            )
                          })()
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{classItem.teacher_name || "Sem professor"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{classItem.current_students || 0}</span>
                          <span className="text-muted-foreground">/</span>
                          <span>{classItem.max_capacity}</span>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAccess(classItem)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Acessar
                          </Button>
                          {!isTeacher && (
                            <>
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
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                {searchTerm
                  ? "Nenhuma turma encontrada"
                  : isTeacher 
                    ? "Você ainda não tem turmas atribuídas" 
                    : "Nenhuma turma cadastrada"}
              </div>
            ) : (
              filteredClasses.map((classItem) => (
                <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{classItem.name}</CardTitle>
                        {classItem.level && (() => {
                          const category = getClassCategory(classItem.level)
                          return category ? (
                            <div className="flex flex-col gap-1 mt-2">
                              <Badge 
                                className={`${getAgeGroupBadgeClass(category.ageGroup)} border font-semibold w-fit`}
                              >
                                {category.ageGroup}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-medium">
                                {category.level}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="mt-2">{classItem.level}</Badge>
                          )
                        })()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{classItem.teacher_name || "Sem professor"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <span className="font-medium">{classItem.current_students || 0}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span>{classItem.max_capacity}</span>
                        <span className="text-muted-foreground"> alunos</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{getScheduleInfo(classItem.schedules)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {classItem.is_active ? (
                        <Badge variant="default">Ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAccess(classItem)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Acessar
                      </Button>
                      {!isTeacher && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(classItem)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(classItem)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
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
