from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_roles
from app.models import User, UserRole, Turma, Professor
from app.schemas import TurmaCreate, TurmaResponse, TurmaUpdate

router = APIRouter()


@router.get("/", response_model=List[TurmaResponse])
async def list_turmas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Listar todas as turmas (Admin vê todas, Professor vê apenas as suas)
    """
    query = db.query(Turma).filter(Turma.is_active == True)
    
    if current_user.role == UserRole.PROFESSOR:
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if professor:
            query = query.filter(Turma.professor_id == professor.id)
    
    turmas = query.offset(skip).limit(limit).all()
    return turmas


@router.get("/{turma_id}", response_model=TurmaResponse)
async def get_turma(
    turma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Obter detalhes de uma turma específica
    """
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    # Professor só pode ver suas próprias turmas
    if current_user.role == UserRole.PROFESSOR:
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if not professor or turma.professor_id != professor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar esta turma",
            )
    
    return turma


@router.post("/", response_model=TurmaResponse, status_code=status.HTTP_201_CREATED)
async def create_turma(
    turma_data: TurmaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """
    Criar nova turma (apenas Admin)
    """
    # Verificar se professor existe
    professor = db.query(Professor).filter(Professor.id == turma_data.professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )

    new_turma = Turma(**turma_data.dict())
    db.add(new_turma)
    db.commit()
    db.refresh(new_turma)

    return new_turma


@router.put("/{turma_id}", response_model=TurmaResponse)
async def update_turma(
    turma_id: int,
    turma_data: TurmaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """
    Atualizar dados de uma turma (apenas Admin)
    """
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )

    update_data = turma_data.dict(exclude_unset=True)
    
    # Se está mudando o professor, verificar se existe
    if "professor_id" in update_data:
        professor = db.query(Professor).filter(Professor.id == update_data["professor_id"]).first()
        if not professor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professor não encontrado",
            )
    
    for field, value in update_data.items():
        setattr(turma, field, value)

    db.commit()
    db.refresh(turma)
    return turma


@router.delete("/{turma_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_turma(
    turma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """
    Desativar uma turma (soft delete)
    """
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )

    turma.is_active = False
    db.commit()
    return None
