from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.api.dependencies import require_roles
from app.models import User, UserRole, Aula, Turma, Professor, Chamada
from app.schemas import AulaCreate, AulaResponse, AulaUpdate, ChamadaCreate, ChamadaResponse

router = APIRouter()


@router.get("/", response_model=List[AulaResponse])
async def list_aulas(
    turma_id: int = None,
    data: date = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Listar aulas com filtros opcionais
    """
    query = db.query(Aula)
    
    if turma_id:
        query = query.filter(Aula.turma_id == turma_id)
    
    if data:
        query = query.filter(Aula.data == data)
    
    # Professor só vê aulas de suas turmas
    if current_user.role == UserRole.PROFESSOR:
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if professor:
            query = query.join(Turma).filter(Turma.professor_id == professor.id)
    
    aulas = query.offset(skip).limit(limit).all()
    return aulas


@router.post("/", response_model=AulaResponse, status_code=status.HTTP_201_CREATED)
async def create_aula(
    aula_data: AulaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Criar nova aula
    """
    # Verificar se a turma existe
    turma = db.query(Turma).filter(Turma.id == aula_data.turma_id).first()
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    # Professor só pode criar aulas para suas turmas
    if current_user.role == UserRole.PROFESSOR:
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if not professor or turma.professor_id != professor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para criar aula nesta turma",
            )
    
    new_aula = Aula(**aula_data.dict())
    db.add(new_aula)
    db.commit()
    db.refresh(new_aula)
    
    return new_aula


@router.put("/{aula_id}", response_model=AulaResponse)
async def update_aula(
    aula_id: int,
    aula_data: AulaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Atualizar dados de uma aula
    """
    aula = db.query(Aula).filter(Aula.id == aula_id).first()
    if not aula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Professor só pode editar aulas de suas turmas
    if current_user.role == UserRole.PROFESSOR:
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if not professor or aula.turma.professor_id != professor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para editar esta aula",
            )
    
    update_data = aula_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(aula, field, value)
    
    db.commit()
    db.refresh(aula)
    return aula


@router.post("/{aula_id}/chamada", response_model=ChamadaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_chamada(
    aula_id: int,
    chamada_data: ChamadaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PROFESSOR)),
):
    """
    Registrar presença de um aluno em uma aula
    """
    aula = db.query(Aula).filter(Aula.id == aula_id).first()
    if not aula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Verificar permissão do professor
    professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
    if not professor or aula.turma.professor_id != professor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para fazer chamada nesta aula",
        )
    
    # Verificar se já existe chamada para este aluno nesta aula
    existing_chamada = db.query(Chamada).filter(
        Chamada.aula_id == aula_id,
        Chamada.aluno_id == chamada_data.aluno_id
    ).first()
    
    if existing_chamada:
        # Atualizar chamada existente
        existing_chamada.presente = chamada_data.presente
        existing_chamada.observacao = chamada_data.observacao
        db.commit()
        db.refresh(existing_chamada)
        return existing_chamada
    
    # Criar nova chamada
    new_chamada = Chamada(
        aula_id=aula_id,
        aluno_id=chamada_data.aluno_id,
        presente=chamada_data.presente,
        observacao=chamada_data.observacao
    )
    db.add(new_chamada)
    db.commit()
    db.refresh(new_chamada)
    
    return new_chamada


@router.get("/{aula_id}/chamadas", response_model=List[ChamadaResponse])
async def get_chamadas(
    aula_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Obter todas as chamadas de uma aula
    """
    aula = db.query(Aula).filter(Aula.id == aula_id).first()
    if not aula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    chamadas = db.query(Chamada).filter(Chamada.aula_id == aula_id).all()
    return chamadas
