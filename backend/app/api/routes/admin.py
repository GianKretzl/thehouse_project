from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Class, Teacher, Student, Lesson
from app.schemas import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.COORDINATOR)),
):
    """
    Obter estatísticas do dashboard administrativo
    """
    total_classes = db.query(func.count(Class.id)).filter(Class.is_active == True).scalar()
    total_teachers = db.query(func.count(Teacher.id)).scalar()
    total_students = db.query(func.count(Student.id)).filter(Student.is_active == True).scalar()
    total_lessons_today = db.query(func.count(Lesson.id)).filter(Lesson.date == date.today()).scalar()

    return {
        "total_classes": total_classes or 0,
        "total_teachers": total_teachers or 0,
        "total_students": total_students or 0,
        "total_lessons_today": total_lessons_today or 0,
    }

