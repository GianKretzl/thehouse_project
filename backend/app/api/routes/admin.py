from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Turma, Professor, Aluno, Aula
from app.schemas import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Obter estatísticas do dashboard administrativo
    """
    total_turmas = db.query(func.count(Turma.id)).filter(Turma.is_active == True).scalar()
    total_professores = db.query(func.count(Professor.id)).scalar()
    total_alunos = db.query(func.count(Aluno.id)).filter(Aluno.is_active == True).scalar()
    total_aulas_hoje = db.query(func.count(Aula.id)).filter(Aula.data == date.today()).scalar()

    return {
        "total_turmas": total_turmas or 0,
        "total_professores": total_professores or 0,
        "total_alunos": total_alunos or 0,
        "total_aulas_hoje": total_aulas_hoje or 0,
    }
