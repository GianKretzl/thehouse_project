from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.dependencies import require_role
from app.models import User, UserRole, Professor
from app.schemas import ProfessorCreate, ProfessorResponse, ProfessorUpdate

router = APIRouter()


@router.get("/", response_model=List[ProfessorResponse])
async def list_professores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Listar todos os professores
    """
    professores = db.query(Professor).offset(skip).limit(limit).all()
    return professores


@router.get("/{professor_id}", response_model=ProfessorResponse)
async def get_professor(
    professor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Obter detalhes de um professor específico
    """
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )
    return professor


@router.post("/", response_model=ProfessorResponse, status_code=status.HTTP_201_CREATED)
async def create_professor(
    professor_data: ProfessorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Criar novo professor
    """
    # Verificar se já existe usuário com este email
    existing_user = db.query(User).filter(User.email == professor_data.user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado",
        )

    # Verificar se já existe professor com este CPF
    existing_professor = db.query(Professor).filter(Professor.cpf == professor_data.cpf).first()
    if existing_professor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado",
        )

    # Criar usuário
    hashed_password = get_password_hash(professor_data.user.password)
    new_user = User(
        name=professor_data.user.name,
        email=professor_data.user.email,
        hashed_password=hashed_password,
        role=UserRole.PROFESSOR,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Criar professor
    new_professor = Professor(
        user_id=new_user.id,
        cpf=professor_data.cpf,
        telefone=professor_data.telefone,
        especialidade=professor_data.especialidade,
        data_admissao=professor_data.data_admissao,
    )
    db.add(new_professor)
    db.commit()
    db.refresh(new_professor)

    return new_professor


@router.put("/{professor_id}", response_model=ProfessorResponse)
async def update_professor(
    professor_id: int,
    professor_data: ProfessorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Atualizar dados de um professor
    """
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )

    update_data = professor_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(professor, field, value)

    db.commit()
    db.refresh(professor)
    return professor


@router.delete("/{professor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_professor(
    professor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Deletar um professor
    """
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )

    # Desativar o usuário associado
    user = db.query(User).filter(User.id == professor.user_id).first()
    if user:
        user.is_active = False

    db.delete(professor)
    db.commit()
    return None
