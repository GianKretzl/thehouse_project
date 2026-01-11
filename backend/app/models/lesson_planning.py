"""
Database models for Lesson Planning System
Sistema de Planejamento com 8 unidades por livro
"""
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Book(Base):
    """Livros didáticos com 8 unidades"""
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    publisher = Column(String(100))
    isbn = Column(String(20))
    level = Column(String(50), nullable=False)  # A1, A2, B1, etc
    total_units = Column(Integer, default=8)
    description = Column(Text)

    # Relationships
    units = relationship("UnitContent", back_populates="book", cascade="all, delete-orphan")
    class_assignments = relationship("ClassBookAssignment", back_populates="book")


class UnitContent(Base):
    """Conteúdo de cada unidade (1-8)"""
    __tablename__ = "unit_contents"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    unit_number = Column(Integer, nullable=False)  # 1 a 8
    topic = Column(String(200), nullable=False)
    grammar_points = Column(JSON)  # Lista de pontos gramaticais
    vocabulary_topics = Column(JSON)  # Lista de tópicos de vocabulário
    skills_focus = Column(JSON)  # reading, writing, speaking, listening
    pages = Column(String(50))  # Ex: "10-25"
    estimated_lessons = Column(Integer, default=4)
    notes = Column(Text)

    # Relationships
    book = relationship("Book", back_populates="units")


class ClassBookAssignment(Base):
    """Associação entre Turma e Livro"""
    __tablename__ = "class_book_assignments"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    current_unit = Column(Integer, default=1)  # Unidade atual (1-8)

    # Relationships
    class_ = relationship("Class", foreign_keys=[class_id])
    book = relationship("Book", back_populates="class_assignments")


class LessonPlan(Base):
    """Planejamento pedagógico de uma aula"""
    __tablename__ = "lesson_plans"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"))
    unit_number = Column(Integer, nullable=False)  # 1 a 8
    
    # Planejamento da aula (método PPP - Presentation, Practice, Production)
    objectives = Column(Text)  # Objetivos da aula
    warm_up = Column(Text)  # Atividade de aquecimento
    presentation = Column(Text)  # Apresentação do conteúdo
    practice = Column(Text)  # Prática controlada
    production = Column(Text)  # Produção livre
    homework = Column(Text)  # Lição de casa
    materials = Column(JSON)  # Lista de materiais necessários
    notes = Column(Text)  # Observações
    
    created_at = Column(Date, nullable=False)

    # Relationships
    lesson = relationship("Lesson", foreign_keys=[lesson_id])
    class_ = relationship("Class", foreign_keys=[class_id])
    book = relationship("Book", foreign_keys=[book_id])
