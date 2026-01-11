import { fetchApi } from './api'

// Re-export Educational API
export { classesApi, lessonsApi } from './educational-api'
export type { Lesson } from './educational-api'

export interface CalendarEvent {
  id: number
  title: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  location?: string
  class_id?: number
  event_type: string
  created_by: number
  is_active: boolean
  created_at: string
  updated_at?: string
  creator_name?: string
  class_name?: string
}

export interface MaterialReservation {
  id: number
  material_name: string
  description?: string
  reservation_date: string
  start_time: string
  end_time: string
  quantity: number
  location?: string
  class_id?: number
  notes?: string
  reserved_by: number
  status: string
  created_at: string
  updated_at?: string
  reserver_name?: string
  class_name?: string
}

export interface EventCreateData {
  title: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  location?: string
  class_id?: number
  event_type?: string
}

export interface MaterialReservationCreateData {
  material_name: string
  description?: string
  reservation_date: string
  start_time: string
  end_time: string
  quantity?: number
  location?: string
  class_id?: number
  notes?: string
}

// Events API
export const eventsApi = {
  list: async (params?: {
    start_date?: string
    end_date?: string
    event_type?: string
    class_id?: number
  }): Promise<CalendarEvent[]> => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<CalendarEvent[]>(`/calendar/events${queryString}`)
  },

  get: async (id: number): Promise<CalendarEvent> => {
    return fetchApi<CalendarEvent>(`/calendar/events/${id}`)
  },

  create: async (data: EventCreateData): Promise<CalendarEvent> => {
    return fetchApi<CalendarEvent>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (id: number, data: Partial<EventCreateData>): Promise<CalendarEvent> => {
    return fetchApi<CalendarEvent>(`/calendar/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/calendar/events/${id}`, {
      method: 'DELETE'
    })
  },
}

// Material Reservations API
export const materialReservationsApi = {
  list: async (params?: {
    start_date?: string
    end_date?: string
    status?: string
  }): Promise<MaterialReservation[]> => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<MaterialReservation[]>(`/calendar/material-reservations${queryString}`)
  },

  get: async (id: number): Promise<MaterialReservation> => {
    return fetchApi<MaterialReservation>(`/calendar/material-reservations/${id}`)
  },

  create: async (data: MaterialReservationCreateData): Promise<MaterialReservation> => {
    return fetchApi<MaterialReservation>('/calendar/material-reservations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: async (
    id: number,
    data: Partial<MaterialReservationCreateData> & { status?: string }
  ): Promise<MaterialReservation> => {
    return fetchApi<MaterialReservation>(`/calendar/material-reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/calendar/material-reservations/${id}`, {
      method: 'DELETE'
    })
  },
}
