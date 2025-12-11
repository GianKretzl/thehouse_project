from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Student
from app.schemas import StudentCreate, StudentResponse, StudentUpdate

router = APIRouter()


@router.get("/", response_model=List[StudentResponse])
async def list_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE)),
):
    """
    Listar todos os alunos
    """
    students = db.query(Student).filter(Student.is_active == True).offset(skip).limit(limit).all()
    return students


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Obter detalhes de um aluno específico
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )
    return student


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Criar novo aluno
    """
    # Check if student with this CPF already exists
    existing_student = db.query(Student).filter(Student.cpf == student_data.cpf).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado",
        )

    # Check if student with this email already exists (if provided)
    if student_data.email:
        existing_email = db.query(Student).filter(Student.email == student_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado",
            )

    new_student = Student(**student_data.dict())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Atualizar dados de um aluno
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )

    update_data = student_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR)),
):
    """
    Desativar um aluno (soft delete)
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )

    student.is_active = False
    db.commit()

    return None
