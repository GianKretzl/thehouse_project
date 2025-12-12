from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Enrollment, Student
from app.schemas import EnrollmentResponse, EnrollmentCreate

router = APIRouter()


@router.get("/class/{class_id}/students", response_model=List[EnrollmentResponse])
async def list_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Listar alunos matriculados em uma turma
    """
    enrollments = db.query(Enrollment).filter(
        Enrollment.class_id == class_id,
        Enrollment.is_active == True
    ).all()
    return enrollments


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Matricular aluno em turma
    """
    # Check if enrollment already exists
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == enrollment_data.student_id,
        Enrollment.class_id == enrollment_data.class_id
    ).first()
    
    if existing:
        if existing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aluno já está matriculado nesta turma"
            )
        else:
            # Reativar matrícula
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            return existing
    
    new_enrollment = Enrollment(**enrollment_data.dict())
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Remover matrícula (soft delete)
    """
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matrícula não encontrada"
        )
    
    enrollment.is_active = False
    db.commit()
    return None
