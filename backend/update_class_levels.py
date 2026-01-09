"""
Script para atualizar os níveis das turmas e criar novas turmas com os níveis corretos
Kids: English Adventure 1-5
Adults: InstaEnglish Starter, InstaEnglish 1-4
"""

import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Class, Enrollment, Student, Teacher, User
from datetime import date, time
import random

# Definir os níveis corretos
KIDS_LEVELS = [
    "English Adventure 1",
    "English Adventure 2", 
    "English Adventure 3",
    "English Adventure 4",
    "English Adventure 5"
]

ADULTS_LEVELS = [
    "InstaEnglish Starter",
    "InstaEnglish 1",
    "InstaEnglish 2",
    "InstaEnglish 3",
    "InstaEnglish 4"
]

# Novos nomes para as turmas (letra + número)
CLASS_NAMES = [
    "K1", "K2", "K3", "K4", "K5",  # Kids
    "A1", "A2", "A3", "A4", "A5"   # Adults
]

def get_or_create_students(db: Session, count: int = 5):
    """Pega alunos existentes ou cria novos se necessário"""
    students = db.query(Student).limit(count).all()
    
    if len(students) < count:
        # Criar estudantes adicionais se necessário
        needed = count - len(students)
        print(f"Criando {needed} novos alunos...")
        
        for i in range(needed):
            # Verificar se já existe um usuário para este aluno
            student_num = len(students) + i + 1
            email = f"student{student_num}@thehouse.com"
            
            existing_user = db.query(User).filter(User.email == email).first()
            if not existing_user:
                user = User(
                    name=f"Student {student_num}",
                    email=email,
                    role="STUDENT",
                    is_active=True
                )
                user.set_password("123456")
                db.add(user)
                db.flush()
                
                student = Student(
                    user_id=user.id,
                    name=user.name,
                    date_of_birth=date(2010, 1, 1),
                    guardian_name=f"Guardian {student_num}",
                    guardian_phone="(11) 99999-9999",
                    guardian_email=f"guardian{student_num}@email.com"
                )
                db.add(student)
                students.append(student)
        
        db.commit()
        students = db.query(Student).limit(count).all()
    
    return students[:count]

def update_existing_classes(db: Session):
    """Atualiza as turmas existentes com os novos níveis e nomes"""
    classes = db.query(Class).all()
    
    print(f"\n=== Atualizando {len(classes)} turmas existentes ===")
    
    for idx, cls in enumerate(classes):
        # Atribuir nível Kids para as primeiras turmas
        if idx < 5:
            new_level = KIDS_LEVELS[idx]
            new_name = CLASS_NAMES[idx]
            print(f"Turma '{cls.name}' -> '{new_name}' | Nível: {new_level}")
        else:
            # Turmas extras recebem níveis Adults
            adults_idx = (idx - 5) % len(ADULTS_LEVELS)
            new_level = ADULTS_LEVELS[adults_idx]
            new_name = CLASS_NAMES[5 + adults_idx] if (5 + adults_idx) < len(CLASS_NAMES) else f"A{idx-4}"
            print(f"Turma '{cls.name}' -> '{new_name}' | Nível: {new_level}")
        
        cls.name = new_name
        cls.level = new_level
        
        # Garantir que a turma tenha pelo menos 5 alunos matriculados
        current_enrollments = db.query(Enrollment).filter(
            Enrollment.class_id == cls.id,
            Enrollment.is_active == True
        ).count()
        
        if current_enrollments < 5:
            students = get_or_create_students(db, 5)
            enrolled_student_ids = [
                e.student_id for e in db.query(Enrollment).filter(
                    Enrollment.class_id == cls.id
                ).all()
            ]
            
            for student in students:
                if student.id not in enrolled_student_ids:
                    enrollment = Enrollment(
                        student_id=student.id,
                        class_id=cls.id,
                        enrollment_date=date.today(),
                        is_active=True
                    )
                    db.add(enrollment)
            
            print(f"  -> Matriculados {5 - current_enrollments} novos alunos")
    
    db.commit()
    print("✓ Turmas existentes atualizadas!")

def create_adults_classes(db: Session):
    """Cria turmas para todos os níveis Adults se não existirem"""
    print("\n=== Criando turmas Adults ===")
    
    # Pegar um professor para atribuir às turmas
    teacher = db.query(Teacher).first()
    if not teacher:
        print("⚠ Nenhum professor encontrado. Criando professor padrão...")
        user = User(
            name="Professor Padrão",
            email="teacher@thehouse.com",
            role="TEACHER",
            is_active=True
        )
        user.set_password("123456")
        db.add(user)
        db.flush()
        
        teacher = Teacher(
            user_id=user.id,
            name=user.name,
            subject="English"
        )
        db.add(teacher)
        db.commit()
    
    # Verificar quais níveis Adults já existem
    existing_adults_levels = [
        cls.level for cls in db.query(Class).filter(
            Class.level.in_(ADULTS_LEVELS)
        ).all()
    ]
    
    # Criar turmas para níveis que não existem
    for idx, level in enumerate(ADULTS_LEVELS):
        if level not in existing_adults_levels:
            class_name = f"A{idx + 1}"
            print(f"Criando turma '{class_name}' com nível '{level}'")
            
            new_class = Class(
                name=class_name,
                level=level,
                description=f"Turma de {level}",
                teacher_id=teacher.id,
                max_capacity=15,
                start_date=date(2026, 1, 6),
                is_active=True
            )
            db.add(new_class)
            db.flush()
            
            # Matricular 5 alunos
            students = get_or_create_students(db, 5)
            for student in students:
                enrollment = Enrollment(
                    student_id=student.id,
                    class_id=new_class.id,
                    enrollment_date=date.today(),
                    is_active=True
                )
                db.add(enrollment)
            
            print(f"  -> Turma criada com 5 alunos matriculados")
    
    db.commit()
    print("✓ Turmas Adults criadas!")

def create_kids_classes(db: Session):
    """Garante que todas as turmas Kids existam"""
    print("\n=== Verificando turmas Kids ===")
    
    teacher = db.query(Teacher).first()
    if not teacher:
        print("⚠ Nenhum professor encontrado!")
        return
    
    existing_kids_levels = [
        cls.level for cls in db.query(Class).filter(
            Class.level.in_(KIDS_LEVELS)
        ).all()
    ]
    
    for idx, level in enumerate(KIDS_LEVELS):
        if level not in existing_kids_levels:
            class_name = f"K{idx + 1}"
            print(f"Criando turma Kids '{class_name}' com nível '{level}'")
            
            new_class = Class(
                name=class_name,
                level=level,
                description=f"Turma de {level}",
                teacher_id=teacher.id,
                max_capacity=15,
                start_date=date(2026, 1, 6),
                is_active=True
            )
            db.add(new_class)
            db.flush()
            
            # Matricular 5 alunos
            students = get_or_create_students(db, 5)
            for student in students:
                enrollment = Enrollment(
                    student_id=student.id,
                    class_id=new_class.id,
                    enrollment_date=date.today(),
                    is_active=True
                )
                db.add(enrollment)
            
            print(f"  -> Turma criada com 5 alunos matriculados")
    
    db.commit()
    print("✓ Turmas Kids verificadas!")

def show_summary(db: Session):
    """Mostra um resumo das turmas atualizadas"""
    print("\n" + "="*60)
    print("RESUMO DAS TURMAS")
    print("="*60)
    
    kids_classes = db.query(Class).filter(Class.level.in_(KIDS_LEVELS)).all()
    adults_classes = db.query(Class).filter(Class.level.in_(ADULTS_LEVELS)).all()
    
    print(f"\n📚 KIDS - {len(kids_classes)} turmas:")
    for cls in kids_classes:
        enrollments = db.query(Enrollment).filter(
            Enrollment.class_id == cls.id,
            Enrollment.is_active == True
        ).count()
        print(f"  • {cls.name} - {cls.level} ({enrollments} alunos)")
    
    print(f"\n👥 ADULTS - {len(adults_classes)} turmas:")
    for cls in adults_classes:
        enrollments = db.query(Enrollment).filter(
            Enrollment.class_id == cls.id,
            Enrollment.is_active == True
        ).count()
        print(f"  • {cls.name} - {cls.level} ({enrollments} alunos)")
    
    print("\n" + "="*60)

def main():
    print("="*60)
    print("ATUALIZAÇÃO DE NÍVEIS DAS TURMAS")
    print("="*60)
    
    db = SessionLocal()
    try:
        # 1. Atualizar turmas existentes
        update_existing_classes(db)
        
        # 2. Criar turmas Kids faltantes
        create_kids_classes(db)
        
        # 3. Criar turmas Adults
        create_adults_classes(db)
        
        # 4. Mostrar resumo
        show_summary(db)
        
        print("\n✅ Atualização concluída com sucesso!")
        
    except Exception as e:
        print(f"\n❌ Erro durante a atualização: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
