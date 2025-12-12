from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.api.dependencies import require_role
from app.models import User, UserRole, Lesson, Class, Teacher, Attendance
from app.schemas import LessonCreate, LessonResponse, LessonUpdate, AttendanceCreate, AttendanceResponse

router = APIRouter()


@router.get("/", response_model=List[LessonResponse])
async def list_lessons(
    class_id: int = None,
    date: date = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Listar aulas com filtros opcionais
    """
    query = db.query(Lesson)
    
    if class_id:
        query = query.filter(Lesson.class_id == class_id)
    
    if date:
        query = query.filter(Lesson.date == date)
    
    # Teacher can only see lessons from their classes
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if teacher:
            query = query.join(Class).filter(Class.teacher_id == teacher.id)
    
    lessons = query.offset(skip).limit(limit).all()
    return lessons


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Criar nova aula
    """
    # Check if class exists
    class_ = db.query(Class).filter(Class.id == lesson_data.class_id).first()
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    # Teacher can only create lessons for their classes
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para criar aula nesta turma",
            )
    
    new_lesson = Lesson(**lesson_data.dict())
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    
    return new_lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: int,
    lesson_data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Atualizar dados de uma aula
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Teacher can only edit lessons from their classes
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or lesson.class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para editar esta aula",
            )
    
    update_data = lesson_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lesson, field, value)
    
    db.commit()
    db.refresh(lesson)
    
    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Deletar uma aula
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Teacher can only delete lessons from their classes
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or lesson.class_.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para deletar esta aula",
            )
    
    db.delete(lesson)
    db.commit()
    
    return None


# Attendance endpoints
@router.post("/attendance/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Registrar chamada (presença) de um aluno
    """
    lesson = db.query(Lesson).filter(Lesson.id == attendance_data.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    new_attendance = Attendance(**attendance_data.dict())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    
    return new_attendance


@router.post("/attendance/bulk", status_code=status.HTTP_201_CREATED)
async def create_bulk_attendances(
    attendances: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.DIRECTOR, UserRole.SECRETARY)),
):
    """
    Registrar múltiplas presenças de uma vez
    """
    if not attendances:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lista de presenças vazia",
        )
    
    # Verificar se a aula existe
    lesson_id = attendances[0].lesson_id
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    # Criar todas as presenças
    for attendance_data in attendances:
        new_attendance = Attendance(**attendance_data.dict())
        db.add(new_attendance)
    
    db.commit()
    return {"message": f"{len(attendances)} presenças registradas com sucesso"}


@router.get("/{lesson_id}/attendances", response_model=List[AttendanceResponse])
async def list_attendances(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.PEDAGOGUE, UserRole.TEACHER)),
):
    """
    Listar chamadas de uma aula
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aula não encontrada",
        )
    
    attendances = db.query(Attendance).filter(Attendance.lesson_id == lesson_id).all()
    return attendances

