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
    role: "TEACHER";
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
  teacher_id: number;
  max_capacity: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ClassCreate {
  name: string;
  description?: string;
  level?: string;
  teacher_id: number;
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
  student_id: number;
  class_id: number;
  assessment_type: string;
  grade: number;
  max_grade: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface AssessmentCreate {
  student_id: number;
  class_id: number;
  assessment_type: string;
  grade: number;
  max_grade: number;
  date: string;
  description?: string;
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
    return fetchApi<Assessment>('/assessments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<AssessmentCreate>): Promise<Assessment> {
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
