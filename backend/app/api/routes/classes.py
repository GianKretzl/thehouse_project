from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Class, Teacher
from app.schemas import ClassCreate, ClassResponse, ClassUpdate

router = APIRouter()


@router.get("/", response_model=List[ClassResponse])
async def list_classes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Listar todas as turmas (Admin vê todas, Professor vê apenas as suas)
    """
    query = db.query(Class).options(
        joinedload(Class.schedules),
        joinedload(Class.teacher).joinedload(Teacher.user)
    ).filter(Class.is_active == True)
    
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if teacher:
            query = query.filter(Class.teacher_id == teacher.id)
    
    classes = query.offset(skip).limit(limit).all()
    
    # Adicionar nome do professor na resposta
    result = []
    for class_obj in classes:
        class_dict = {
            "id": class_obj.id,
            "name": class_obj.name,
            "description": class_obj.description,
            "level": class_obj.level,
            "teacher_id": class_obj.teacher_id,
            "teacher_name": class_obj.teacher.user.name if class_obj.teacher else None,
            "max_capacity": class_obj.max_capacity,
            "start_date": class_obj.start_date,
            "end_date": class_obj.end_date,
            "is_active": class_obj.is_active,
            "created_at": class_obj.created_at,
            "schedules": class_obj.schedules
        }
        result.append(class_dict)
    
    return result


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Obter detalhes de uma turma específica
    """
    class_ = db.query(Class).filter(Class.id == class_id).first()
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    # Teacher can only view their own classes
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar esta turma",
            )
    
    return class_


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Criar nova turma (apenas Admin)
    Professor é opcional - pode ser atribuído depois
    """
    # Check if teacher exists (if provided)
    if class_data.teacher_id:
        teacher = db.query(Teacher).filter(Teacher.id == class_data.teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professor não encontrado",
            )

    new_class = Class(**class_data.dict())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return new_class


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Atualizar dados de uma turma (Diretor ou Secretário)
    """
    class_ = db.query(Class).filter(Class.id == class_id).first()
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )

    # If updating teacher, check if new teacher exists
    if class_data.teacher_id:
        teacher = db.query(Teacher).filter(Teacher.id == class_data.teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professor não encontrado",
            )

    update_data = class_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(class_, field, value)

    db.commit()
    db.refresh(class_)

    return class_


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR)),
):
    """
    Desativar uma turma (soft delete)
    """
    class_ = db.query(Class).filter(Class.id == class_id).first()
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )

    class_.is_active = False
    db.commit()

    return None

