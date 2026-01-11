from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import require_role, get_current_user
from app.models import User, UserRole, Assessment, Lesson, Teacher, Class
from app.schemas import AssessmentCreate, AssessmentResponse, AssessmentUpdate

router = APIRouter()


@router.get("/", response_model=List[AssessmentResponse])
async def list_assessments(
    class_id: int = None,
    lesson_id: int = None,
    student_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Listar avaliações com filtros opcionais
    """
    query = db.query(Assessment)
    
    # Always join with Lesson to enable filters
    query = query.join(Lesson)
    
    # Filtrar por turma (class_id)
    if class_id:
        query = query.filter(Lesson.class_id == class_id)
    
    # Filtrar por aula específica
    if lesson_id:
        query = query.filter(Assessment.lesson_id == lesson_id)
    
    # Filtrar por aluno
    if student_id:
        query = query.filter(Assessment.student_id == student_id)
    
    # Teacher pode ver apenas suas turmas
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if teacher:
            query = query.join(Class).filter(Class.teacher_id == teacher.id)
    
    assessments = query.offset(skip).limit(limit).all()
    return assessments


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Criar nova avaliação (lançar nota)
    """
    lesson = db.query(Lesson).filter(Lesson.id == assessment_data.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Check teacher permission (apenas para professores)
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or lesson.class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para lançar notas nesta aula",
            )
    
    new_assessment = Assessment(**assessment_data.dict())
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    
    return new_assessment


@router.put("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: int,
    assessment_data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Atualizar uma avaliação
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada",
        )
    
    # Check teacher permission (apenas para professores)
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or assessment.lesson.class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para editar esta avaliação",
            )
    
    update_data = assessment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assessment, field, value)
    
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deletar uma avaliação
    - DIRECTOR e SECRETARY: podem deletar qualquer avaliação
    - TEACHER: pode deletar avaliações de suas próprias turmas
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada",
        )
    
    # Buscar a lição para verificar a turma
    lesson = db.query(Lesson).filter(Lesson.id == assessment.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Buscar a turma
    class_ = db.query(Class).filter(Class.id == lesson.class_id).first()
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    # Verificar permissões
    if current_user.role == UserRole.TEACHER:
        # Buscar o registro de Teacher associado ao user
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de professor não encontrado",
            )
        
        # Verificar se o professor é o dono da turma
        if class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir esta avaliação",
            )
    elif current_user.role not in [UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir avaliações",
        )
    
    db.delete(assessment)
    db.commit()
    
    return None

