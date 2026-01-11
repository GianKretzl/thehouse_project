"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { eventsApi, materialReservationsApi } from "@/lib/calendar-api"
import { lessonsApi, classesApi } from "@/lib/educational-api"
import type { CalendarEvent, MaterialReservation } from "@/lib/calendar-api"
import type { Lesson } from "@/lib/educational-api"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Package } from "lucide-react"
import { format, startOfMonth, endOfMonth, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface Class {
  id: number
  name: string
  level: string | null
}

type CalendarItemType = 'event' | 'lesson' | 'reservation'

interface CalendarItem {
  id: number
  type: CalendarItemType
  title: string
  description?: string
  date: Date
  start_time?: string
  end_time?: string
  location?: string
  class_name?: string
  creator_name?: string
  status?: string
  event_type?: string
}

export default function CalendarPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [reservations, setReservations] = useState<MaterialReservation[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showReservationDialog, setShowReservationDialog] = useState(false)

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    location: '',
    class_id: 'none',
    event_type: 'general'
  })

  const [reservationForm, setReservationForm] = useState({
    material_name: '',
    description: '',
    reservation_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    quantity: 1,
    location: '',
    class_id: 'none',
    notes: ''
  })

  useEffect(() => {
    loadData()
    loadClasses()
  }, [selectedDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)

      const [eventsData, reservationsData, lessonsData] = await Promise.all([
        eventsApi.list({
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd')
        }),
        materialReservationsApi.list({
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd')
        }),
        loadLessons(start, end)
      ])

      setEvents(eventsData)
      setReservations(reservationsData)
      setLessons(lessonsData)
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do calendário",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async (start: Date, end: Date): Promise<any[]> => {
    try {
      if (user?.role === 'TEACHER') {
        // Professor vê apenas suas próprias aulas
        const myClasses = await classesApi.list()
        const allLessons: any[] = []

        for (const cls of myClasses) {
          // Buscar aulas já registradas
          const lessons = await lessonsApi.list(cls.id)
          const filtered = lessons.filter((l: any) => {
            const lessonDate = parseISO(l.date)
            return lessonDate >= start && lessonDate <= end
          })
          allLessons.push(...filtered.map((l: any) => ({ 
            ...l, 
            class_name: cls.name,
            teacher_name: user.name,
            is_registered: true
          })))

          // Gerar aulas futuras baseadas nos schedules
          if (cls.schedules && cls.schedules.length > 0) {
            const futureClasses = generateFutureClasses(cls, start, end, lessons)
            allLessons.push(...futureClasses.map((fc: any) => ({
              ...fc,
              teacher_name: user.name
            })))
          }
        }

        return allLessons
      } else {
        // Outros papéis veem todas as aulas de todas as turmas
        const allClasses = await classesApi.list()
        const allLessons: any[] = []

        for (const cls of allClasses) {
          // Buscar aulas já registradas
          const lessons = await lessonsApi.list(cls.id)
          const filtered = lessons.filter((l: any) => {
            const lessonDate = parseISO(l.date)
            return lessonDate >= start && lessonDate <= end
          })
          
          const teacherName = cls.teacher_name || 'Professor não atribuído'
          
          allLessons.push(...filtered.map((l: any) => ({ 
            ...l, 
            class_name: cls.name,
            teacher_name: teacherName,
            is_registered: true
          })))

          // Gerar aulas futuras baseadas nos schedules
          if (cls.schedules && cls.schedules.length > 0) {
            const futureClasses = generateFutureClasses(cls, start, end, lessons)
            allLessons.push(...futureClasses.map((fc: any) => ({
              ...fc,
              teacher_name: teacherName
            })))
          }
        }

        return allLessons
      }
    } catch (error) {
      console.error('Erro ao carregar aulas:', error)
      return []
    }
  }

  // Gerar aulas futuras baseadas nos schedules da turma
  const generateFutureClasses = (cls: any, start: Date, end: Date, existingLessons: any[]) => {
    const futureClasses: any[] = []
    const existingDates = new Set(existingLessons.map((l: any) => l.date))

    // Iterar por cada dia no intervalo
    let currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      // Ajustar: API usa 0=Segunda, mas JS Date usa 0=Domingo
      const apiDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

      // Verificar se há aula neste dia da semana
      const schedule = cls.schedules?.find((s: any) => s.weekday === apiDayOfWeek)
      
      if (schedule) {
        const dateStr = format(currentDate, 'yyyy-MM-dd')
        
        // Só adicionar se não existir aula registrada neste dia
        if (!existingDates.has(dateStr)) {
          futureClasses.push({
            id: `future-${cls.id}-${dateStr}`,
            class_id: cls.id,
            class_name: cls.name,
            date: dateStr,
            content: null,
            is_registered: false,
            is_future: true,
            start_time: schedule.start_time,
            end_time: schedule.end_time
          })
        }
      }

      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    return futureClasses
  }

  const loadClasses = async () => {
    try {
      const classesData = await classesApi.list()
      setClasses(classesData)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const handleCreateEvent = async () => {
    try {
      await eventsApi.create({
        ...eventForm,
        class_id: eventForm.class_id && eventForm.class_id !== 'none' ? parseInt(eventForm.class_id) : undefined
      })

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso"
      })

      setShowEventDialog(false)
      setEventForm({
        title: '',
        description: '',
        event_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '',
        end_time: '',
        location: '',
        class_id: 'none',
        event_type: 'general'
      })
      loadData()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento",
        variant: "destructive"
      })
    }
  }

  const handleCreateReservation = async () => {
    try {
      await materialReservationsApi.create({
        ...reservationForm,
        class_id: reservationForm.class_id && reservationForm.class_id !== 'none' ? parseInt(reservationForm.class_id) : undefined
      })

      toast({
        title: "Sucesso",
        description: "Reserva criada com sucesso"
      })

      setShowReservationDialog(false)
      setReservationForm({
        material_name: '',
        description: '',
        reservation_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '',
        end_time: '',
        quantity: 1,
        location: '',
        class_id: 'none',
        notes: ''
      })
      loadData()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a reserva",
        variant: "destructive"
      })
    }
  }

  // Combinar todos os itens do calendário
  const calendarItems: CalendarItem[] = [
    ...events.map(e => ({
      id: e.id,
      type: 'event' as const,
      title: e.title,
      description: e.description,
      date: parseISO(e.event_date),
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location,
      class_name: e.class_name,
      creator_name: e.creator_name,
      event_type: e.event_type
    })),
    ...reservations.map(r => ({
      id: r.id,
      type: 'reservation' as const,
      title: `📦 ${r.material_name}`,
      description: r.description,
      date: parseISO(r.reservation_date),
      start_time: r.start_time,
      end_time: r.end_time,
      location: r.location,
      class_name: r.class_name,
      creator_name: r.reserver_name,
      status: r.status
    })),
    ...lessons.map((l: any) => ({
      id: l.id,
      type: 'lesson' as const,
      title: l.is_future 
        ? `📅 Aula Programada - ${l.class_name || 'Turma'}`
        : `📚 Aula - ${l.class_name || 'Turma'}`,
      description: l.is_future 
        ? 'Aula ainda não registrada'
        : (l.content || 'Sem conteúdo'),
      date: parseISO(l.date),
      start_time: l.start_time || undefined,
      end_time: l.end_time || undefined,
      class_name: l.class_name,
      creator_name: l.teacher_name,
      status: l.is_future ? 'programada' : 'registrada'
    }))
  ]

  // Filtrar itens do dia selecionado
  const selectedDayItems = calendarItems.filter(item =>
    isSameDay(item.date, selectedDate)
  ).sort((a, b) => {
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time)
    }
    return 0
  })

  // Obter datas com eventos para destacar no calendário
  const datesWithEvents = calendarItems.map(item => item.date)

  const getItemBadgeColor = (item: CalendarItem) => {
    if (item.type === 'event') {
      switch (item.event_type) {
        case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
        case 'exam': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        case 'holiday': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
      }
    } else if (item.type === 'reservation') {
      switch (item.status) {
        case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      }
    } else if (item.type === 'lesson') {
      // Diferenciar aulas registradas das programadas
      if (item.status === 'programada') {
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200 border border-purple-200'
      } else {
        return 'bg-primary/10 text-primary'
      }
    }
    return 'bg-primary/10 text-primary'
  }

  const getItemTypeLabel = (type: CalendarItemType, status?: string) => {
    switch (type) {
      case 'event': return 'Evento'
      case 'reservation': return 'Reserva'
      case 'lesson': return status === 'programada' ? 'Aula Programada' : 'Aula Registrada'
    }
  }

  const canCreateEvents = user?.role && ['TEACHER', 'SECRETARY', 'COORDINATOR', 'DIRECTOR'].includes(user.role)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize eventos, aulas e reservas de material
          </p>
        </div>
        {canCreateEvents && (
          <div className="flex gap-2">
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Evento</DialogTitle>
                  <DialogDescription>
                    Adicione um novo evento ao calendário institucional
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">Título *</Label>
                    <Input
                      id="event-title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Ex: Reunião Pedagógica"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-description">Descrição</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Detalhes do evento..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-date">Data *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-type">Tipo</Label>
                      <Select
                        value={eventForm.event_type}
                        onValueChange={(value) => setEventForm({ ...eventForm, event_type: value })}
                      >
                        <SelectTrigger id="event-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Geral</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="exam">Avaliação</SelectItem>
                          <SelectItem value="holiday">Feriado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-start">Horário Início</Label>
                      <Input
                        id="event-start"
                        type="time"
                        value={eventForm.start_time}
                        onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-end">Horário Fim</Label>
                      <Input
                        id="event-end"
                        type="time"
                        value={eventForm.end_time}
                        onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-location">Local</Label>
                    <Input
                      id="event-location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="Ex: Sala de reuniões"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-class">Turma (opcional)</Label>
                    <Select
                      value={eventForm.class_id}
                      onValueChange={(value) => setEventForm({ ...eventForm, class_id: value })}
                    >
                      <SelectTrigger id="event-class">
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma (Evento geral)</SelectItem>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name} - {cls.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateEvent} disabled={!eventForm.title || !eventForm.event_date}>
                    Criar Evento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Reservar Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Reservar Material</DialogTitle>
                  <DialogDescription>
                    Reserve materiais didáticos ou equipamentos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="material-name">Material *</Label>
                    <Input
                      id="material-name"
                      value={reservationForm.material_name}
                      onChange={(e) => setReservationForm({ ...reservationForm, material_name: e.target.value })}
                      placeholder="Ex: Projetor, Livros, etc."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="material-description">Descrição</Label>
                    <Textarea
                      id="material-description"
                      value={reservationForm.description}
                      onChange={(e) => setReservationForm({ ...reservationForm, description: e.target.value })}
                      placeholder="Detalhes sobre o material..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="res-date">Data *</Label>
                      <Input
                        id="res-date"
                        type="date"
                        value={reservationForm.reservation_date}
                        onChange={(e) => setReservationForm({ ...reservationForm, reservation_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={reservationForm.quantity}
                        onChange={(e) => setReservationForm({ ...reservationForm, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="res-start">Horário Início *</Label>
                      <Input
                        id="res-start"
                        type="time"
                        value={reservationForm.start_time}
                        onChange={(e) => setReservationForm({ ...reservationForm, start_time: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="res-end">Horário Fim *</Label>
                      <Input
                        id="res-end"
                        type="time"
                        value={reservationForm.end_time}
                        onChange={(e) => setReservationForm({ ...reservationForm, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="res-location">Local de Uso</Label>
                    <Input
                      id="res-location"
                      value={reservationForm.location}
                      onChange={(e) => setReservationForm({ ...reservationForm, location: e.target.value })}
                      placeholder="Ex: Sala 101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="res-class">Turma (opcional)</Label>
                    <Select
                      value={reservationForm.class_id}
                      onValueChange={(value) => setReservationForm({ ...reservationForm, class_id: value })}
                    >
                      <SelectTrigger id="res-class">
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name} - {cls.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={reservationForm.notes}
                      onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                      placeholder="Informações adicionais..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReservationDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateReservation}
                    disabled={!reservationForm.material_name || !reservationForm.reservation_date || !reservationForm.start_time || !reservationForm.end_time}
                  >
                    Criar Reserva
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="capitalize">
              {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              Selecione uma data para ver os eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                hasEvents: datesWithEvents
              }}
              modifiersStyles={{
                hasEvents: {
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Lista de eventos do dia */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              {selectedDayItems.length === 0 
                ? "Nenhum evento programado para este dia"
                : `${selectedDayItems.length} ${selectedDayItems.length === 1 ? 'item' : 'itens'} programado${selectedDayItems.length === 1 ? '' : 's'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : selectedDayItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum evento programado para este dia</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayItems.map((item) => (
                  <Card key={`${item.type}-${item.id}`} className="border-l-4" style={{
                    borderLeftColor: item.type === 'event' ? '#3b82f6' : item.type === 'reservation' ? '#f59e0b' : '#8b5cf6'
                  }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          {item.description && (
                            <CardDescription>{item.description}</CardDescription>
                          )}
                        </div>
                        <Badge className={getItemBadgeColor(item)}>
                          {getItemTypeLabel(item.type, item.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {item.start_time && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{item.start_time} {item.end_time && `- ${item.end_time}`}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.class_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 shrink-0" />
                            <span>{item.class_name}</span>
                          </div>
                        )}
                        {item.creator_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4 shrink-0" />
                            <span>{item.creator_name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
