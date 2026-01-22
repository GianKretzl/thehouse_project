"""add performance indexes

Revision ID: performance_indexes_001
Revises: 
Create Date: 2026-01-22 13:48:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'performance_indexes_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Índices para a tabela lessons (aulas)
    # Melhora performance de queries por class_id
    op.create_index('idx_lessons_class_id', 'lessons', ['class_id'])
    op.create_index('idx_lessons_lesson_date', 'lessons', ['lesson_date'])
    op.create_index('idx_lessons_class_date', 'lessons', ['class_id', 'lesson_date'])
    
    # Índices para a tabela assessments (avaliações)
    # Melhora performance de queries por class_id e student_id
    op.create_index('idx_assessments_class_id', 'assessments', ['class_id'])
    op.create_index('idx_assessments_student_id', 'assessments', ['student_id'])
    op.create_index('idx_assessments_class_student', 'assessments', ['class_id', 'student_id'])
    op.create_index('idx_assessments_assessment_date', 'assessments', ['assessment_date'])
    
    # Índices para a tabela attendances (frequências)
    # Melhora performance de queries por lesson_id e student_id
    op.create_index('idx_attendances_lesson_id', 'attendances', ['lesson_id'])
    op.create_index('idx_attendances_student_id', 'attendances', ['student_id'])
    op.create_index('idx_attendances_lesson_student', 'attendances', ['lesson_id', 'student_id'])
    
    # Índices para a tabela enrollments (matrículas)
    # Melhora performance de queries por class_id e student_id
    op.create_index('idx_enrollments_class_id', 'enrollments', ['class_id'])
    op.create_index('idx_enrollments_student_id', 'enrollments', ['student_id'])
    op.create_index('idx_enrollments_is_active', 'enrollments', ['is_active'])
    
    # Índices para a tabela classes (turmas)
    # Melhora performance de queries por teacher_id e is_active
    op.create_index('idx_classes_teacher_id', 'classes', ['teacher_id'])
    op.create_index('idx_classes_is_active', 'classes', ['is_active'])
    
    # Índices para a tabela users
    # Email já deve ter índice unique, mas garantir performance
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    
    # Índices para a tabela events (eventos do calendário)
    op.create_index('idx_events_event_date', 'events', ['event_date'])
    op.create_index('idx_events_class_id', 'events', ['class_id'])
    op.create_index('idx_events_is_active', 'events', ['is_active'])


def downgrade():
    # Remove todos os índices na ordem inversa
    op.drop_index('idx_events_is_active', 'events')
    op.drop_index('idx_events_class_id', 'events')
    op.drop_index('idx_events_event_date', 'events')
    
    op.drop_index('idx_users_is_active', 'users')
    op.drop_index('idx_users_role', 'users')
    
    op.drop_index('idx_classes_is_active', 'classes')
    op.drop_index('idx_classes_teacher_id', 'classes')
    
    op.drop_index('idx_enrollments_is_active', 'enrollments')
    op.drop_index('idx_enrollments_student_id', 'enrollments')
    op.drop_index('idx_enrollments_class_id', 'enrollments')
    
    op.drop_index('idx_attendances_lesson_student', 'attendances')
    op.drop_index('idx_attendances_student_id', 'attendances')
    op.drop_index('idx_attendances_lesson_id', 'attendances')
    
    op.drop_index('idx_assessments_assessment_date', 'assessments')
    op.drop_index('idx_assessments_class_student', 'assessments')
    op.drop_index('idx_assessments_student_id', 'assessments')
    op.drop_index('idx_assessments_class_id', 'assessments')
    
    op.drop_index('idx_lessons_class_date', 'lessons')
    op.drop_index('idx_lessons_lesson_date', 'lessons')
    op.drop_index('idx_lessons_class_id', 'lessons')
