"use client"

import { useState, useEffect } from "react"
import { teachersApi, Teacher } from "@/lib/educational-api"
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TeacherDialog } from "@/components/dialogs/teacher-dialog"
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog"
import { useToast } from "@/hooks/use-toast"

export default function TeachersPage() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>()
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      const data = await teachersApi.list()
      setTeachers(data)
    } catch (error) {
      console.error("Erro ao carregar professores:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.cpf.includes(searchTerm) ||
    teacher.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedTeacher(undefined)
    setDialogOpen(true)
  }

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return
    setDeleteLoading(true)
    try {
      await teachersApi.delete(selectedTeacher.id)
      toast({
        title: "Professor removido!",
        description: "O professor foi removido com sucesso.",
      })
      loadTeachers()
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao remover professor",
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
            <h1 className="text-3xl font-bold tracking-tight">Professores</h1>
            <p className="text-muted-foreground">
              Gerencie os professores da instituição
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Professor
          </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Professores</CardTitle>
          <CardDescription>
            Total de {teachers.length} professores cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Carregando professores...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Contratação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {searchTerm
                        ? "Nenhum professor encontrado"
                        : "Nenhum professor cadastrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.user.name}
                      </TableCell>
                      <TableCell>{teacher.cpf}</TableCell>
                      <TableCell>{teacher.user.email}</TableCell>
                      <TableCell>{teacher.specialty || "-"}</TableCell>
                      <TableCell>{teacher.phone || "-"}</TableCell>
                      <TableCell>{formatDate(teacher.hire_date)}</TableCell>
                      <TableCell>
                        {teacher.user.is_active ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(teacher)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacher={selectedTeacher}
        onSuccess={loadTeachers}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Excluir Professor"
        description={`Tem certeza que deseja excluir o professor "${selectedTeacher?.user.name}"? Esta ação não pode ser desfeita.`}
      />
    </>
  )
}
