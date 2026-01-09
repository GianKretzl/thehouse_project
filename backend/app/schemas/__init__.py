from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


class UserRole(str, Enum):
    DIRECTOR = "DIRECTOR"
    PEDAGOGUE = "PEDAGOGUE"
    SECRETARY = "SECRETARY"
    TEACHER = "TEACHER"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Teacher Schemas
class TeacherBase(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=11)
    phone: Optional[str] = None
    specialty: Optional[str] = None
    hire_date: Optional[date] = None


class TeacherUserCreate(BaseModel):
    """Schema para criação de usuário professor (sem role)"""
    email: EmailStr
    name: str
    password: str


class TeacherCreate(TeacherBase):
    user: TeacherUserCreate


class TeacherUpdate(BaseModel):
    phone: Optional[str] = None
    specialty: Optional[str] = None


class TeacherResponse(TeacherBase):
    id: int
    user: UserResponse
    created_at: datetime

    class Config:
        from_attributes = True


# Student Schemas
class StudentBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    cpf: str = Field(..., min_length=11, max_length=11)
    birth_date: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    is_active: Optional[bool] = None


class StudentResponse(StudentBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Schedule Schemas
class ScheduleBase(BaseModel):
    weekday: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time
    room: Optional[str] = None


class ScheduleCreate(ScheduleBase):
    class_id: int


class ScheduleResponse(ScheduleBase):
    id: int
    class_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Class Schemas
class ClassBase(BaseModel):
    name: str
    description: Optional[str] = None
    level: Optional[str] = None
    max_capacity: int = 15
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ClassCreate(ClassBase):
    teacher_id: Optional[int] = None


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    teacher_id: Optional[int] = None
    max_capacity: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class ClassResponse(ClassBase):
    id: int
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None  # Nome do professor
    schedules: List[ScheduleResponse] = []  # Horários da turma
    current_students: int = 0  # Número atual de alunos matriculados
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Lesson Schemas
class LessonBase(BaseModel):
    date: date
    content: Optional[str] = None
    notes: Optional[str] = None


class LessonCreate(LessonBase):
    class_id: int


class LessonUpdate(BaseModel):
    content: Optional[str] = None
    notes: Optional[str] = None


class LessonResponse(LessonBase):
    id: int
    class_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Attendance Schemas
class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"


class AttendanceBase(BaseModel):
    student_id: int
    status: AttendanceStatus
    note: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    lesson_id: int


class AttendanceResponse(AttendanceBase):
    id: int
    lesson_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BulkAttendanceRecord(BaseModel):
    student_id: int
    status: AttendanceStatus


class BulkAttendanceCreate(BaseModel):
    class_id: int
    date: date
    attendances: List[BulkAttendanceRecord]
    without_attendance: bool = False
    notes: Optional[str] = None


# Enrollment Schemas
class EnrollmentBase(BaseModel):
    student_id: int
    class_id: int
    enrollment_date: Optional[date] = None


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentResponse(EnrollmentBase):
    id: int
    is_active: bool
    created_at: datetime
    student: StudentResponse

    class Config:
        from_attributes = True


# Assessment Schemas
class AssessmentBase(BaseModel):
    student_id: int
    type: str
    grade: float = Field(..., ge=0, le=10)
    weight: float = Field(default=1.0, ge=0)
    note: Optional[str] = None
    assessment_date: date


class AssessmentCreate(AssessmentBase):
    lesson_id: int


class AssessmentUpdate(BaseModel):
    type: Optional[str] = None
    grade: Optional[float] = Field(None, ge=0, le=10)
    weight: Optional[float] = Field(None, ge=0)
    note: Optional[str] = None
    assessment_date: Optional[date] = None


class AssessmentResponse(AssessmentBase):
    id: int
    lesson_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Stats
class DashboardStats(BaseModel):
    total_classes: int
    total_teachers: int
    total_students: int
    total_lessons_today: int
