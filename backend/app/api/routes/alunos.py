from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Aluno
from app.schemas import AlunoCreate, AlunoResponse, AlunoUpdate

router = APIRouter()


@router.get("/", response_model=List[AlunoResponse])
async def list_alunos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Listar todos os alunos
    """
    alunos = db.query(Aluno).filter(Aluno.is_active == True).offset(skip).limit(limit).all()
    return alunos


@router.get("/{aluno_id}", response_model=AlunoResponse)
async def get_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Obter detalhes de um aluno específico
    """
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )
    return aluno


@router.post("/", response_model=AlunoResponse, status_code=status.HTTP_201_CREATED)
async def create_aluno(
    aluno_data: AlunoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Criar novo aluno
    """
    # Verificar se já existe aluno com este CPF
    existing_aluno = db.query(Aluno).filter(Aluno.cpf == aluno_data.cpf).first()
    if existing_aluno:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado",
        )

    # Verificar se já existe aluno com este email (se fornecido)
    if aluno_data.email:
        existing_email = db.query(Aluno).filter(Aluno.email == aluno_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado",
            )

    new_aluno = Aluno(**aluno_data.dict())
    db.add(new_aluno)
    db.commit()
    db.refresh(new_aluno)

    return new_aluno


@router.put("/{aluno_id}", response_model=AlunoResponse)
async def update_aluno(
    aluno_id: int,
    aluno_data: AlunoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Atualizar dados de um aluno
    """
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )

    update_data = aluno_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(aluno, field, value)

    db.commit()
    db.refresh(aluno)
    return aluno


@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Desativar um aluno (soft delete)
    """
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )

    aluno.is_active = False
    db.commit()
    return None
