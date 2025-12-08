from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    PROFESSOR = "PROFESSOR"


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


# Professor Schemas
class ProfessorBase(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=11)
    telefone: Optional[str] = None
    especialidade: Optional[str] = None
    data_admissao: Optional[date] = None


class ProfessorCreate(ProfessorBase):
    user: UserCreate


class ProfessorUpdate(BaseModel):
    telefone: Optional[str] = None
    especialidade: Optional[str] = None


class ProfessorResponse(ProfessorBase):
    id: int
    user: UserResponse
    created_at: datetime

    class Config:
        from_attributes = True


# Aluno Schemas
class AlunoBase(BaseModel):
    nome: str
    email: Optional[EmailStr] = None
    cpf: str = Field(..., min_length=11, max_length=11)
    data_nascimento: Optional[date] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    responsavel_nome: Optional[str] = None
    responsavel_telefone: Optional[str] = None


class AlunoCreate(AlunoBase):
    pass


class AlunoUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    responsavel_nome: Optional[str] = None
    responsavel_telefone: Optional[str] = None
    is_active: Optional[bool] = None


class AlunoResponse(AlunoBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Turma Schemas
class TurmaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    nivel: Optional[str] = None
    capacidade_maxima: int = 15
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None


class TurmaCreate(TurmaBase):
    professor_id: int


class TurmaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    nivel: Optional[str] = None
    professor_id: Optional[int] = None
    capacidade_maxima: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    is_active: Optional[bool] = None


class TurmaResponse(TurmaBase):
    id: int
    professor_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Horario Schemas
class HorarioBase(BaseModel):
    dia_semana: int = Field(..., ge=0, le=6)
    hora_inicio: time
    hora_fim: time
    sala: Optional[str] = None


class HorarioCreate(HorarioBase):
    turma_id: int


class HorarioResponse(HorarioBase):
    id: int
    turma_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Aula Schemas
class AulaBase(BaseModel):
    data: date
    conteudo: Optional[str] = None
    observacoes: Optional[str] = None


class AulaCreate(AulaBase):
    turma_id: int


class AulaUpdate(BaseModel):
    conteudo: Optional[str] = None
    observacoes: Optional[str] = None


class AulaResponse(AulaBase):
    id: int
    turma_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Chamada Schemas
class ChamadaBase(BaseModel):
    aluno_id: int
    presente: bool
    observacao: Optional[str] = None


class ChamadaCreate(ChamadaBase):
    aula_id: int


class ChamadaResponse(ChamadaBase):
    id: int
    aula_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Avaliacao Schemas
class AvaliacaoBase(BaseModel):
    aluno_id: int
    tipo: str
    nota: float = Field(..., ge=0, le=10)
    peso: float = Field(default=1.0, ge=0)
    observacao: Optional[str] = None
    data_avaliacao: date


class AvaliacaoCreate(AvaliacaoBase):
    aula_id: int


class AvaliacaoUpdate(BaseModel):
    tipo: Optional[str] = None
    nota: Optional[float] = Field(None, ge=0, le=10)
    peso: Optional[float] = Field(None, ge=0)
    observacao: Optional[str] = None
    data_avaliacao: Optional[date] = None


class AvaliacaoResponse(AvaliacaoBase):
    id: int
    aula_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Stats
class DashboardStats(BaseModel):
    total_turmas: int
    total_professores: int
    total_alunos: int
    total_aulas_hoje: int
