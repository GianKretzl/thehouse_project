from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, union_all, select, literal
from typing import List
from datetime import datetime

from app.api.dependencies import get_db, get_current_user
from app.models import User, Student, Class, Enrollment, Lesson, Assessment

router = APIRouter()


@router.get("/recent")
def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """
    Retorna as atividades recentes do sistema
    """
    activities = []
    
    # Buscar últimos alunos criados
    recent_students = db.query(Student).order_by(desc(Student.created_at)).limit(5).all()
    for student in recent_students:
        activities.append({
            "id": f"student-{student.id}",
            "type": "student",
            "title": "Novo aluno matriculado",
            "description": f"{student.name}",
            "time": student.created_at,
            "icon": "UserPlus"
        })
    
    # Buscar últimas turmas criadas
    recent_classes = db.query(Class).order_by(desc(Class.created_at)).limit(5).all()
    for cls in recent_classes:
        activities.append({
            "id": f"class-{cls.id}",
            "type": "class",
            "title": "Turma criada",
            "description": f"{cls.name} - {cls.level}",
            "time": cls.created_at,
            "icon": "Users"
        })
    
    # Buscar últimas aulas registradas
    recent_lessons = db.query(Lesson).order_by(desc(Lesson.created_at)).limit(5).all()
    for lesson in recent_lessons:
        class_info = db.query(Class).filter(Class.id == lesson.class_id).first()
        activities.append({
            "id": f"lesson-{lesson.id}",
            "type": "lesson",
            "title": "Aula registrada",
            "description": f"{class_info.name if class_info else 'Turma'} - {lesson.content[:50] if lesson.content else 'Conteúdo'}",
            "time": lesson.created_at,
            "icon": "BookOpen"
        })
    
    # Buscar últimas avaliações lançadas
    recent_assessments = db.query(Assessment).order_by(desc(Assessment.created_at)).limit(5).all()
    for assessment in recent_assessments:
        student = db.query(Student).filter(Student.id == assessment.student_id).first()
        activities.append({
            "id": f"assessment-{assessment.id}",
            "type": "assessment",
            "title": "Avaliação lançada",
            "description": f"{assessment.type} - {student.name if student else 'Aluno'} - Nota: {assessment.grade}",
            "time": assessment.created_at,
            "icon": "FileText"
        })
    
    # Buscar últimas matrículas
    recent_enrollments = db.query(Enrollment).order_by(desc(Enrollment.created_at)).limit(5).all()
    for enrollment in recent_enrollments:
        student = db.query(Student).filter(Student.id == enrollment.student_id).first()
        class_info = db.query(Class).filter(Class.id == enrollment.class_id).first()
        activities.append({
            "id": f"enrollment-{enrollment.id}",
            "type": "enrollment",
            "title": "Matrícula realizada",
            "description": f"{student.name if student else 'Aluno'} - {class_info.name if class_info else 'Turma'}",
            "time": enrollment.created_at,
            "icon": "UserPlus"
        })
    
    # Ordenar todas as atividades por data (mais recente primeiro)
    activities.sort(key=lambda x: x['time'], reverse=True)
    
    # Formatar tempo relativo
    now = datetime.now()
    for activity in activities[:limit]:
        time_diff = now - activity['time']
        if time_diff.days == 0:
            if time_diff.seconds < 3600:
                minutes = time_diff.seconds // 60
                activity['time'] = f"Há {minutes} minuto{'s' if minutes != 1 else ''}"
            else:
                hours = time_diff.seconds // 3600
                activity['time'] = f"Há {hours} hora{'s' if hours != 1 else ''}"
        elif time_diff.days == 1:
            activity['time'] = "Ontem"
        elif time_diff.days < 7:
            activity['time'] = f"Há {time_diff.days} dia{'s' if time_diff.days != 1 else ''}"
        else:
            activity['time'] = activity['time'].strftime("%d/%m/%Y")
    
    return activities[:limit]
