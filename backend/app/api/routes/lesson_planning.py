"""
API Routes for Lesson Planning
Rotas para gerenciamento de planejamento pedagógico
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models import User, UserRole, Teacher, Class
from app.models.lesson_planning import Book, UnitContent, ClassBookAssignment, LessonPlan
from app.schemas.lesson_planning import (
    BookCreate, BookUpdate, Book as BookSchema,
    UnitContentCreate, UnitContentUpdate, UnitContent as UnitContentSchema,
    ClassBookAssignmentCreate, ClassBookAssignmentUpdate, ClassBookAssignment as ClassBookAssignmentSchema,
    LessonPlanCreate, LessonPlanUpdate, LessonPlan as LessonPlanSchema
)

router = APIRouter()


# ============= BOOKS =============

@router.get("/books", response_model=List[BookSchema])
async def list_books(
    skip: int = 0,
    limit: int = 100,
    level: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar livros didáticos"""
    query = db.query(Book)
    if level:
        query = query.filter(Book.level == level)
    books = query.offset(skip).limit(limit).all()
    return books


@router.post("/books", response_model=BookSchema, status_code=status.HTTP_201_CREATED)
async def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar novo livro (apenas DIRECTOR/PEDAGOGUE)"""
    if current_user.role not in [UserRole.DIRECTOR, UserRole.PEDAGOGUE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas diretores e pedagogos podem criar livros"
        )
    
    db_book = Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/books/{book_id}", response_model=BookSchema)
async def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um livro"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return book


@router.put("/books/{book_id}", response_model=BookSchema)
async def update_book(
    book_id: int,
    book: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar livro (apenas DIRECTOR/PEDAGOGUE)"""
    if current_user.role not in [UserRole.DIRECTOR, UserRole.PEDAGOGUE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas diretores e pedagogos podem editar livros"
        )
    
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    for key, value in book.dict(exclude_unset=True).items():
        setattr(db_book, key, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar livro (apenas DIRECTOR)"""
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas diretores podem deletar livros"
        )
    
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    db.delete(db_book)
    db.commit()


# ============= UNIT CONTENTS =============

@router.post("/books/{book_id}/units", response_model=UnitContentSchema, status_code=status.HTTP_201_CREATED)
async def create_unit_content(
    book_id: int,
    unit: UnitContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar conteúdo de unidade (apenas DIRECTOR/PEDAGOGUE)"""
    if current_user.role not in [UserRole.DIRECTOR, UserRole.PEDAGOGUE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas diretores e pedagogos podem criar conteúdo de unidades"
        )
    
    # Verificar se livro existe
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    # Verificar se já existe esta unidade para este livro
    existing = db.query(UnitContent).filter(
        UnitContent.book_id == book_id,
        UnitContent.unit_number == unit.unit_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Unidade {unit.unit_number} já existe para este livro"
        )
    
    db_unit = UnitContent(**unit.dict(), book_id=book_id)
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit


@router.get("/books/{book_id}/units", response_model=List[UnitContentSchema])
async def list_book_units(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar unidades de um livro"""
    units = db.query(UnitContent).filter(
        UnitContent.book_id == book_id
    ).order_by(UnitContent.unit_number).all()
    return units


@router.put("/units/{unit_id}", response_model=UnitContentSchema)
async def update_unit_content(
    unit_id: int,
    unit: UnitContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar conteúdo de unidade"""
    if current_user.role not in [UserRole.DIRECTOR, UserRole.PEDAGOGUE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas diretores e pedagogos podem editar unidades"
        )
    
    db_unit = db.query(UnitContent).filter(UnitContent.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Unidade não encontrada")
    
    for key, value in unit.dict(exclude_unset=True).items():
        setattr(db_unit, key, value)
    
    db.commit()
    db.refresh(db_unit)
    return db_unit


# ============= CLASS BOOK ASSIGNMENTS =============

@router.post("/classes/{class_id}/assign-book", response_model=ClassBookAssignmentSchema, status_code=status.HTTP_201_CREATED)
async def assign_book_to_class(
    class_id: int,
    assignment: ClassBookAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atribuir livro a uma turma"""
    if current_user.role not in [UserRole.DIRECTOR, UserRole.PEDAGOGUE, UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    # Verificar se é professor da turma
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        class_ = db.query(Class).filter(Class.id == class_id).first()
        if not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Você não é professor desta turma")
    
    # Verificar se já existe atribuição ativa
    existing = db.query(ClassBookAssignment).filter(
        ClassBookAssignment.class_id == class_id,
        ClassBookAssignment.end_date == None
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Esta turma já possui um livro ativo. Finalize o livro atual primeiro."
        )
    
    db_assignment = ClassBookAssignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("/classes/{class_id}/book", response_model=ClassBookAssignmentSchema)
async def get_class_current_book(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter livro atual de uma turma"""
    assignment = db.query(ClassBookAssignment).filter(
        ClassBookAssignment.class_id == class_id,
        ClassBookAssignment.end_date == None
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Turma não possui livro atribuído")
    
    return assignment


@router.put("/class-book-assignments/{assignment_id}", response_model=ClassBookAssignmentSchema)
async def update_class_book_assignment(
    assignment_id: int,
    assignment: ClassBookAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar atribuição de livro (ex: mudar unidade atual)"""
    db_assignment = db.query(ClassBookAssignment).filter(
        ClassBookAssignment.id == assignment_id
    ).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Atribuição não encontrada")
    
    # Verificar permissão
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        class_ = db.query(Class).filter(Class.id == db_assignment.class_id).first()
        if not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    for key, value in assignment.dict(exclude_unset=True).items():
        setattr(db_assignment, key, value)
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


# ============= LESSON PLANS =============

@router.post("/lesson-plans", response_model=LessonPlanSchema, status_code=status.HTTP_201_CREATED)
async def create_lesson_plan(
    plan: LessonPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar planejamento de aula"""
    # Verificar permissão
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        class_ = db.query(Class).filter(Class.id == plan.class_id).first()
        if not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Você não é professor desta turma")
    
    from datetime import date
    db_plan = LessonPlan(**plan.dict(), created_at=date.today())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.get("/classes/{class_id}/lesson-plans", response_model=List[LessonPlanSchema])
async def list_class_lesson_plans(
    class_id: int,
    unit_number: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar planejamentos de uma turma"""
    query = db.query(LessonPlan).filter(LessonPlan.class_id == class_id)
    if unit_number:
        query = query.filter(LessonPlan.unit_number == unit_number)
    plans = query.order_by(LessonPlan.created_at.desc()).all()
    return plans


@router.get("/lesson-plans/{plan_id}", response_model=LessonPlanSchema)
async def get_lesson_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter planejamento específico"""
    plan = db.query(LessonPlan).filter(LessonPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Planejamento não encontrado")
    return plan


@router.put("/lesson-plans/{plan_id}", response_model=LessonPlanSchema)
async def update_lesson_plan(
    plan_id: int,
    plan: LessonPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar planejamento"""
    db_plan = db.query(LessonPlan).filter(LessonPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Planejamento não encontrado")
    
    # Verificar permissão
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        class_ = db.query(Class).filter(Class.id == db_plan.class_id).first()
        if not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    for key, value in plan.dict(exclude_unset=True).items():
        setattr(db_plan, key, value)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.delete("/lesson-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar planejamento"""
    db_plan = db.query(LessonPlan).filter(LessonPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Planejamento não encontrado")
    
    # Verificar permissão
    if current_user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        class_ = db.query(Class).filter(Class.id == db_plan.class_id).first()
        if not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    db.delete(db_plan)
    db.commit()
