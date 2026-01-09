/**
 * API Educacional - The House Platform
 * Endpoints para gestão escolar (Alunos, Professores, Turmas, Aulas)
 */

import { fetchApi } from './api';

// ============== TIPOS ==============

export interface Teacher {
  id: number;
  cpf: string;
  phone: string | null;
  specialty: string | null;
  hire_date: string | null;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  created_at: string;
}

export interface TeacherCreate {
  cpf: string;
  phone?: string;
  specialty?: string;
  hire_date?: string;
  user: {
    email: string;
    name: string;
    password: string;
  };
}

export interface TeacherUpdate {
  phone?: string;
  specialty?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string | null;
  cpf: string;
  birth_date: string | null;
  phone: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StudentCreate {
  name: string;
  email?: string;
  cpf: string;
  birth_date?: string;
  phone?: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
}

export interface StudentUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
  is_active?: boolean;
}

export interface Class {
  id: number;
  name: string;
  description: string | null;
  level: string | null;
  teacher_id: number | null;
  teacher_name?: string | null;
  max_capacity: number;
  current_students?: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  schedules?: Schedule[];
}

export interface Schedule {
  id: number;
  class_id: number;
  weekday: number;  // 0=Segunda, 1=Terça, ..., 6=Domingo
  start_time: string;
  end_time: string;
  room: string | null;
  created_at: string;
}

export interface ClassCreate {
  name: string;
  description?: string;
  level?: string;
  teacher_id?: number;
  max_capacity?: number;
  start_date?: string;
  end_date?: string;
}

export interface ClassUpdate {
  name?: string;
  description?: string;
  level?: string;
  teacher_id?: number;
  max_capacity?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface Lesson {
  id: number;
  class_id: number;
  date: string;
  content: string | null;
  notes: string | null;
  created_at: string;
}

export interface LessonCreate {
  class_id: number;
  date: string;
  content?: string;
  notes?: string;
}

export interface Assessment {
  id: number;
  lesson_id: number;
  student_id: number;
  type: string;
  grade: number;
  max_grade: number;
  weight: number;
  note: string | null;
  assessment_date: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentCreate {
  lesson_id: number;
  student_id: number;
  type: string;
  grade: number;
  max_grade?: number;
  weight?: number;
  note?: string;
  assessment_date: string;
}

export interface AssessmentUpdate {
  type?: string;
  grade?: number;
  max_grade?: number;
  weight?: number;
  note?: string;
  assessment_date?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author_id: number;
  class_id: number | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  class_id?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_active?: boolean;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string;
  class_id?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_active?: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  class_id: number | null;
  created_by: number;
  event_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  class_id?: number;
  event_type?: string;
  is_active?: boolean;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  class_id?: number;
  event_type?: string;
  is_active?: boolean;
}

// ============== API DE PROFESSORES ==============

export const teachersApi = {
  async list(skip = 0, limit = 100): Promise<Teacher[]> {
    return fetchApi<Teacher[]>(`/teachers/?skip=${skip}&limit=${limit}`);
  },

  async getById(id: number): Promise<Teacher> {
    return fetchApi<Teacher>(`/teachers/${id}`);
  },

  async create(data: TeacherCreate): Promise<Teacher> {
    return fetchApi<Teacher>('/teachers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: TeacherUpdate): Promise<Teacher> {
    return fetchApi<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/teachers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============== API DE ALUNOS ==============

export const studentsApi = {
  async list(skip = 0, limit = 100): Promise<Student[]> {
    return fetchApi<Student[]>(`/students/?skip=${skip}&limit=${limit}`);
  },

  async getById(id: number): Promise<Student> {
    return fetchApi<Student>(`/students/${id}`);
  },

  async create(data: StudentCreate): Promise<Student> {
    return fetchApi<Student>('/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: StudentUpdate): Promise<Student> {
    return fetchApi<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  async getClasses(studentId: number): Promise<Class[]> {
    return fetchApi<Class[]>(`/students/${studentId}/classes`);
  },
};

// ============== API DE TURMAS ==============

export const classesApi = {
  async list(skip = 0, limit = 100): Promise<Class[]> {
    return fetchApi<Class[]>(`/classes/?skip=${skip}&limit=${limit}`);
  },

  async getById(id: number): Promise<Class> {
    return fetchApi<Class>(`/classes/${id}`);
  },

  async create(data: ClassCreate): Promise<Class> {
    return fetchApi<Class>('/classes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: ClassUpdate): Promise<Class> {
    return fetchApi<Class>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/classes/${id}`, {
      method: 'DELETE',
    });
  },

  async getStudents(classId: number): Promise<Student[]> {
    return fetchApi<Student[]>(`/classes/${classId}/students`);
  },

  async addStudent(classId: number, studentId: number): Promise<void> {
    return fetchApi<void>(`/classes/${classId}/students/${studentId}`, {
      method: 'POST',
    });
  },

  async removeStudent(classId: number, studentId: number): Promise<void> {
    return fetchApi<void>(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
  },
};

// ============== API DE AULAS ==============

export const lessonsApi = {
  async list(classId: number, skip = 0, limit = 100): Promise<Lesson[]> {
    return fetchApi<Lesson[]>(`/lessons/?class_id=${classId}&skip=${skip}&limit=${limit}`);
  },

  async getById(id: number): Promise<Lesson> {
    return fetchApi<Lesson>(`/lessons/${id}`);
  },

  async create(data: LessonCreate): Promise<Lesson> {
    return fetchApi<Lesson>('/lessons/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<LessonCreate>): Promise<Lesson> {
    return fetchApi<Lesson>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/lessons/${id}`, {
      method: 'DELETE',
    });
  },

  async bulkAttendance(data: BulkAttendanceCreate): Promise<any> {
    return fetchApi<any>('/lessons/bulk-attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAttendances(lessonId: number): Promise<Attendance[]> {
    return fetchApi<Attendance[]>(`/lessons/${lessonId}/attendances`);
  },
};

// ============== API DE MATRÍCULAS ==============

export interface Enrollment {
  id: number;
  student_id: number;
  class_id: number;
  enrollment_date: string | null;
  is_active: boolean;
  created_at: string;
  student: Student;
}

export const enrollmentsApi = {
  async getClassStudents(classId: number): Promise<Enrollment[]> {
    return fetchApi<Enrollment[]>(`/enrollments/class/${classId}/students`);
  },
};

// ============== API DE FREQUÊNCIA ==============

export interface Attendance {
  id: number;
  lesson_id: number;
  student_id: number;
  status: 'present' | 'absent' | 'late';
  note: string | null;
  created_at: string;
}

export interface AttendanceCreate {
  lesson_id: number;
  student_id: number;
  status: 'present' | 'absent' | 'late';
  note?: string;
}

export interface BulkAttendanceRecord {
  student_id: number;
  status: 'present' | 'absent' | 'late';
}

export interface BulkAttendanceCreate {
  class_id: number;
  date: string;
  attendances: BulkAttendanceRecord[];
  without_attendance?: boolean;
  notes?: string;
}

export const attendancesApi = {
  async create(data: AttendanceCreate): Promise<Attendance> {
    return fetchApi<Attendance>('/lessons/attendance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async bulkCreate(data: AttendanceCreate[]): Promise<void> {
    return fetchApi<void>('/lessons/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============== API DE AVALIAÇÕES ==============

export const assessmentsApi = {
  async list(classId?: number, studentId?: number, skip = 0, limit = 100): Promise<Assessment[]> {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    if (studentId) params.append('student_id', studentId.toString());
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    return fetchApi<Assessment[]>(`/assessments/?${params.toString()}`);
  },

  async getById(id: number): Promise<Assessment> {
    return fetchApi<Assessment>(`/assessments/${id}`);
  },

  async create(data: AssessmentCreate): Promise<Assessment> {
    // Validação: converte nota inteira para decimal (92 -> 9.2)
    let grade = data.grade;
    if (grade > 10) {
      grade = grade / 10;
    }
    // Validação: não pode exceder max_grade
    const maxGrade = data.max_grade || 10.0;
    if (grade > maxGrade) {
      throw new Error(`Nota não pode exceder ${maxGrade}`);
    }
    if (grade > 10.0) {
      throw new Error('Nota não pode exceder 10.0');
    }

    return fetchApi<Assessment>('/assessments/', {
      method: 'POST',
      body: JSON.stringify({ ...data, grade }),
    });
  },

  async update(id: number, data: AssessmentUpdate): Promise<Assessment> {
    // Mesma validação para update
    if (data.grade !== undefined) {
      let grade = data.grade;
      if (grade > 10) {
        grade = grade / 10;
      }
      const maxGrade = data.max_grade || 10.0;
      if (grade > maxGrade) {
        throw new Error(`Nota não pode exceder ${maxGrade}`);
      }
      if (grade > 10.0) {
        throw new Error('Nota não pode exceder 10.0');
      }
      data.grade = grade;
    }

    return fetchApi<Assessment>(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/assessments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============== API DE AVISOS ==============

export const announcementsApi = {
  async list(classId?: number, isActive?: boolean): Promise<Announcement[]> {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    if (isActive !== undefined) params.append('is_active', isActive.toString());
    return fetchApi<Announcement[]>(`/announcements/?${params.toString()}`);
  },

  async getById(id: number): Promise<Announcement> {
    return fetchApi<Announcement>(`/announcements/${id}`);
  },

  async create(data: AnnouncementCreate): Promise<Announcement> {
    return fetchApi<Announcement>('/announcements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: AnnouncementUpdate): Promise<Announcement> {
    return fetchApi<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============== API DE EVENTOS/AGENDA ==============

export const eventsApi = {
  async list(classId?: number, startDate?: string, endDate?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return fetchApi<Event[]>(`/events/?${params.toString()}`);
  },

  async getById(id: number): Promise<Event> {
    return fetchApi<Event>(`/events/${id}`);
  },

  async create(data: EventCreate): Promise<Event> {
    return fetchApi<Event>('/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: EventUpdate): Promise<Event> {
    return fetchApi<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};
