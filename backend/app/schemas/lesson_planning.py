"""
Schemas para Planejamento Pedagógico
Sistema de 8 unidades por livro com conteúdos específicos
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class UnitContentBase(BaseModel):
    """Conteúdo específico de uma unidade (Grammar, Vocabulary, etc)"""
    unit_number: int = Field(ge=1, le=8, description="Número da unidade (1-8)")
    topic: str = Field(max_length=200, description="Tópico principal da unidade")
    grammar_points: Optional[List[str]] = Field(default=[], description="Pontos gramaticais")
    vocabulary_topics: Optional[List[str]] = Field(default=[], description="Tópicos de vocabulário")
    skills_focus: Optional[List[str]] = Field(default=[], description="Habilidades (reading, writing, speaking, listening)")
    pages: Optional[str] = Field(None, max_length=50, description="Páginas do livro (ex: 10-25)")
    estimated_lessons: Optional[int] = Field(default=4, description="Número estimado de aulas para completar")
    notes: Optional[str] = None


class UnitContentCreate(UnitContentBase):
    book_id: int = Field(description="ID do livro ao qual pertence")


class UnitContentUpdate(BaseModel):
    topic: Optional[str] = Field(None, max_length=200)
    grammar_points: Optional[List[str]] = None
    vocabulary_topics: Optional[List[str]] = None
    skills_focus: Optional[List[str]] = None
    pages: Optional[str] = None
    estimated_lessons: Optional[int] = None
    notes: Optional[str] = None


class UnitContent(UnitContentBase):
    id: int
    book_id: int

    class Config:
        from_attributes = True


class BookBase(BaseModel):
    """Livro didático"""
    title: str = Field(max_length=200, description="Título do livro")
    publisher: Optional[str] = Field(None, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    level: str = Field(max_length=50, description="Nível (A1, A2, B1, etc)")
    total_units: int = Field(default=8, ge=1, le=12, description="Total de unidades (padrão 8)")
    description: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    publisher: Optional[str] = None
    isbn: Optional[str] = None
    level: Optional[str] = None
    total_units: Optional[int] = None
    description: Optional[str] = None


class Book(BookBase):
    id: int
    units: List[UnitContent] = []

    class Config:
        from_attributes = True


class LessonPlanBase(BaseModel):
    """Planejamento de uma aula específica"""
    lesson_id: int = Field(description="ID da aula (Lesson)")
    unit_number: int = Field(ge=1, le=8, description="Unidade sendo trabalhada")
    objectives: Optional[str] = Field(None, description="Objetivos da aula")
    warm_up: Optional[str] = Field(None, description="Atividade de warm-up")
    presentation: Optional[str] = Field(None, description="Apresentação do conteúdo")
    practice: Optional[str] = Field(None, description="Atividades de prática")
    production: Optional[str] = Field(None, description="Produção/aplicação")
    homework: Optional[str] = Field(None, description="Lição de casa")
    materials: Optional[List[str]] = Field(default=[], description="Materiais necessários")
    notes: Optional[str] = None


class LessonPlanCreate(LessonPlanBase):
    class_id: int
    book_id: Optional[int] = None


class LessonPlanUpdate(BaseModel):
    unit_number: Optional[int] = Field(None, ge=1, le=8)
    objectives: Optional[str] = None
    warm_up: Optional[str] = None
    presentation: Optional[str] = None
    practice: Optional[str] = None
    production: Optional[str] = None
    homework: Optional[str] = None
    materials: Optional[List[str]] = None
    notes: Optional[str] = None


class LessonPlan(LessonPlanBase):
    id: int
    class_id: int
    book_id: Optional[int] = None
    created_at: date

    class Config:
        from_attributes = True


class ClassBookAssignmentBase(BaseModel):
    """Associação Turma-Livro"""
    class_id: int
    book_id: int
    start_date: date
    end_date: Optional[date] = None
    current_unit: int = Field(default=1, ge=1, le=8, description="Unidade atual")


class ClassBookAssignmentCreate(ClassBookAssignmentBase):
    pass


class ClassBookAssignmentUpdate(BaseModel):
    current_unit: Optional[int] = Field(None, ge=1, le=8)
    end_date: Optional[date] = None


class ClassBookAssignment(ClassBookAssignmentBase):
    id: int
    book: Optional[Book] = None

    class Config:
        from_attributes = True
