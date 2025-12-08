from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Date, Time, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PROFESSOR = "PROFESSOR"


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

    # Relacionamentos
    professor = relationship("Professor", back_populates="user", uselist=False)


class Professor(Base):
    __tablename__ = "professores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    cpf = Column(String(11), unique=True, nullable=False)
    telefone = Column(String(20))
    especialidade = Column(String(255))
    data_admissao = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="professor")
    turmas = relationship("Turma", back_populates="professor")


class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    cpf = Column(String(11), unique=True, nullable=False)
    data_nascimento = Column(Date)
    telefone = Column(String(20))
    endereco = Column(Text)
    responsavel_nome = Column(String(255))
    responsavel_telefone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    matriculas = relationship("Matricula", back_populates="aluno")


class Turma(Base):
    __tablename__ = "turmas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    nivel = Column(String(100))  # Básico, Pré-Intermediário, Intermediário, Avançado
    professor_id = Column(Integer, ForeignKey("professores.id"))
    capacidade_maxima = Column(Integer, default=15)
    data_inicio = Column(Date)
    data_fim = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    professor = relationship("Professor", back_populates="turmas")
    horarios = relationship("Horario", back_populates="turma")
    matriculas = relationship("Matricula", back_populates="turma")
    aulas = relationship("Aula", back_populates="turma")


class Horario(Base):
    __tablename__ = "horarios"

    id = Column(Integer, primary_key=True, index=True)
    turma_id = Column(Integer, ForeignKey("turmas.id"))
    dia_semana = Column(Integer)  # 0=Segunda, 1=Terça, ..., 6=Domingo
    hora_inicio = Column(Time)
    hora_fim = Column(Time)
    sala = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    turma = relationship("Turma", back_populates="horarios")


class Matricula(Base):
    __tablename__ = "matriculas"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    turma_id = Column(Integer, ForeignKey("turmas.id"))
    data_matricula = Column(Date, default=func.current_date())
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    aluno = relationship("Aluno", back_populates="matriculas")
    turma = relationship("Turma", back_populates="matriculas")


class Aula(Base):
    __tablename__ = "aulas"

    id = Column(Integer, primary_key=True, index=True)
    turma_id = Column(Integer, ForeignKey("turmas.id"))
    data = Column(Date, nullable=False)
    conteudo = Column(Text)
    observacoes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    turma = relationship("Turma", back_populates="aulas")
    chamadas = relationship("Chamada", back_populates="aula")
    avaliacoes = relationship("Avaliacao", back_populates="aula")


class Chamada(Base):
    __tablename__ = "chamadas"

    id = Column(Integer, primary_key=True, index=True)
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    presente = Column(Boolean, default=False)
    observacao = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    aula = relationship("Aula", back_populates="chamadas")
    aluno = relationship("Aluno")


class Avaliacao(Base):
    __tablename__ = "avaliacoes"

    id = Column(Integer, primary_key=True, index=True)
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    tipo = Column(String(100))  # Prova, Trabalho, Participação, etc.
    nota = Column(Float)
    peso = Column(Float, default=1.0)
    observacao = Column(Text)
    data_avaliacao = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    aula = relationship("Aula", back_populates="avaliacoes")
    aluno = relationship("Aluno")
