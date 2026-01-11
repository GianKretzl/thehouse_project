from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Date, Time, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    DIRECTOR = "DIRECTOR"      # Diretor(a) - Nível mais alto, acesso total
    COORDINATOR = "COORDINATOR" # Coordenador(a) - Acompanhamento pedagógico
    SECRETARY = "SECRETARY"    # Secretário(a) - Administrativo
    TEACHER = "TEACHER"        # Docente - Registro diário


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    teacher = relationship("Teacher", back_populates="user", uselist=False)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    cpf = Column(String(11), unique=True, nullable=False)
    phone = Column(String(20))
    specialty = Column(String(255))
    hire_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="teacher")
    classes = relationship("Class", back_populates="teacher")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    cpf = Column(String(11), unique=True, nullable=False)
    birth_date = Column(Date)
    phone = Column(String(20))
    address = Column(Text)
    guardian_name = Column(String(255))
    guardian_phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    level = Column(String(100))  # Básico, Pré-Intermediário, Intermediário, Avançado
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    max_capacity = Column(Integer, default=15)
    start_date = Column(Date)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    teacher = relationship("Teacher", back_populates="classes")
    schedules = relationship("Schedule", back_populates="class_")
    enrollments = relationship("Enrollment", back_populates="class_")
    lessons = relationship("Lesson", back_populates="class_")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    weekday = Column(Integer)  # 0=Segunda, 1=Terça, ..., 6=Domingo
    start_time = Column(Time)
    end_time = Column(Time)
    room = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    class_ = relationship("Class", back_populates="schedules")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    enrollment_date = Column(Date, default=func.current_date())
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="enrollments")
    class_ = relationship("Class", back_populates="enrollments")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    date = Column(Date, nullable=False)
    content = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    class_ = relationship("Class", back_populates="lessons")
    attendances = relationship("Attendance", back_populates="lesson")
    assessments = relationship("Assessment", back_populates="lesson")


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String(20), default="present")  # present, absent, late
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="attendances")
    student = relationship("Student")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    type = Column(String(100))  # Prova, Trabalho, Participação, etc.
    grade = Column(Float)
    max_grade = Column(Float, default=10.0)  # Nota máxima desta avaliação
    weight = Column(Float, default=1.0)
    note = Column(Text)
    assessment_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="assessments")
    student = relationship("Student")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)  # Null = aviso geral
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User")
    class_ = relationship("Class")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_date = Column(Date, nullable=False)
    start_time = Column(Time)
    end_time = Column(Time)
    location = Column(String(255))
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)  # Null = evento geral
    created_by = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String(50))  # aula, prova, reuniao, feriado, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User")
    class_ = relationship("Class")


class MaterialReservation(Base):
    __tablename__ = "material_reservations"

    id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String(255), nullable=False)
    description = Column(Text)
    reservation_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    quantity = Column(Integer, default=1)
    location = Column(String(255))  # Onde será usado
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    reserved_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending, confirmed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reserver = relationship("User")
    class_ = relationship("Class")
