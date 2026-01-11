from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.dependencies import require_role
from app.models import User, UserRole, Teacher
from app.schemas import TeacherCreate, TeacherResponse, TeacherUpdate

router = APIRouter()


@router.get("/", response_model=List[TeacherResponse])
async def list_teachers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.COORDINATOR)),
):
    """
    Listar todos os professores
    """
    teachers = db.query(Teacher).offset(skip).limit(limit).all()
    return teachers


@router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    """
    Obter detalhes de um professor específico
    """
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )
    return teacher


@router.post("/", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Criar novo professor
    """
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == teacher_data.user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado",
        )

    # Check if teacher with this CPF already exists
    existing_teacher = db.query(Teacher).filter(Teacher.cpf == teacher_data.cpf).first()
    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado",
        )

    # Create user
    hashed_password = get_password_hash(teacher_data.user.password)
    new_user = User(
        name=teacher_data.user.name,
        email=teacher_data.user.email,
        hashed_password=hashed_password,
        role=UserRole.TEACHER,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Create teacher
    new_teacher = Teacher(
        user_id=new_user.id,
        cpf=teacher_data.cpf,
        phone=teacher_data.phone,
        specialty=teacher_data.specialty,
        hire_date=teacher_data.hire_date,
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)

    return new_teacher


@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Atualizar dados de um professor
    """
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )

    update_data = teacher_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(teacher, field, value)

    db.commit()
    db.refresh(teacher)

    return teacher


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR)),
):
    """
    Excluir permanentemente um professor (apenas Diretor)
    Remove o professor e suas turmas ficam sem professor atribuído
    """
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado",
        )

    # Remover professor das turmas (teacher_id = NULL)
    from app.models import Class
    db.query(Class).filter(Class.teacher_id == teacher_id).update(
        {"teacher_id": None},
        synchronize_session=False
    )

    # Delete teacher and associated user
    user = teacher.user
    db.delete(teacher)
    db.delete(user)
    db.commit()

    return None
