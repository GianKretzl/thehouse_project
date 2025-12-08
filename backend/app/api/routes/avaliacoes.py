from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_roles
from app.models import User, UserRole, Avaliacao, Aula, Professor
from app.schemas import AvaliacaoCreate, AvaliacaoResponse, AvaliacaoUpdate

router = APIRouter()


@router.get("/", response_model=List[AvaliacaoResponse])
async def list_avaliacoes(
    aula_id: int = None,
    aluno_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PROFESSOR)),
):
    """
    Listar avaliações com filtros opcionais
    """
    query = db.query(Avaliacao)
    
    if aula_id:
        query = query.filter(Avaliacao.aula_id == aula_id)
    
    if aluno_id:
        query = query.filter(Avaliacao.aluno_id == aluno_id)
    
    avaliacoes = query.offset(skip).limit(limit).all()
    return avaliacoes


@router.post("/", response_model=AvaliacaoResponse, status_code=status.HTTP_201_CREATED)
async def create_avaliacao(
    avaliacao_data: AvaliacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PROFESSOR)),
):
    """
    Criar nova avaliação (lançar nota)
    """
    aula = db.query(Aula).filter(Aula.id == avaliacao_data.aula_id).first()
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
            detail="Você não tem permissão para lançar notas nesta aula",
        )
    
    new_avaliacao = Avaliacao(**avaliacao_data.dict())
    db.add(new_avaliacao)
    db.commit()
    db.refresh(new_avaliacao)
    
    return new_avaliacao


@router.put("/{avaliacao_id}", response_model=AvaliacaoResponse)
async def update_avaliacao(
    avaliacao_id: int,
    avaliacao_data: AvaliacaoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PROFESSOR)),
):
    """
    Atualizar uma avaliação
    """
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada",
        )
    
    # Verificar permissão do professor
    professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
    if not professor or avaliacao.aula.turma.professor_id != professor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar esta avaliação",
        )
    
    update_data = avaliacao_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(avaliacao, field, value)
    
    db.commit()
    db.refresh(avaliacao)
    return avaliacao


@router.delete("/{avaliacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avaliacao(
    avaliacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PROFESSOR)),
):
    """
    Deletar uma avaliação
    """
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada",
        )
    
    # Verificar permissão do professor
    professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
    if not professor or avaliacao.aula.turma.professor_id != professor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar esta avaliação",
        )
    
    db.delete(avaliacao)
    db.commit()
    return None
