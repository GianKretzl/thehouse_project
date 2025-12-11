"""
Script para popular o banco com dados de exemplo
Simula um sistema em uso real para diagnóstico e melhorias
"""
from datetime import date, timedelta
import random

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, 
    Student, Teacher, Class, Lesson, Assessment
)


def seed_users(session):
    """Cria usuários de exemplo de cada role"""
    print("📝 Criando usuários...")
    
    users_data = [
        {"email": "diretor@thehouse.edu.br", "name": "Maria Silva Santos", "role": UserRole.DIRECTOR},
        {"email": "pedagoga@thehouse.edu.br", "name": "Ana Paula Oliveira", "role": UserRole.PEDAGOGUE},
        {"email": "secretaria@thehouse.edu.br", "name": "Carlos Alberto Souza", "role": UserRole.SECRETARY},
        {"email": "prof.matematica@thehouse.edu.br", "name": "João Pedro Costa", "role": UserRole.TEACHER},
        {"email": "prof.portugues@thehouse.edu.br", "name": "Mariana Fernandes", "role": UserRole.TEACHER},
        {"email": "prof.ciencias@thehouse.edu.br", "name": "Roberto Lima Santos", "role": UserRole.TEACHER},
        {"email": "prof.historia@thehouse.edu.br", "name": "Juliana Alves Pereira", "role": UserRole.TEACHER},
        {"email": "prof.ingles@thehouse.edu.br", "name": "Ricardo Mendes Silva", "role": UserRole.TEACHER}
    ]
    
    password = get_password_hash("senha123")
    created_users = []
    
    for user_data in users_data:
        existing = session.query(User).filter(User.email == user_data["email"]).first()
        
        if not existing:
            user = User(**user_data, hashed_password=password, is_active=True)
            session.add(user)
            created_users.append(user)
            print(f"  ✓ {user_data['name']}")
        else:
            created_users.append(existing)
            print(f"  • {user_data['name']} já existe")
    
    session.commit()
    print(f"✅ {len(created_users)} usuários\n")
    return created_users


def seed_students(session):
    """Cria alunos de exemplo"""
    print("👨‍🎓 Criando alunos...")
    
    students_data = [
        {"name": "Lucas Gabriel Oliveira", "birth_date": date(2000, 3, 15), "cpf": "12345678901"},
        {"name": "Maria Eduarda Santos", "birth_date": date(1998, 5, 22), "cpf": "12345678902"},
        {"name": "Pedro Henrique Silva", "birth_date": date(2001, 1, 10), "cpf": "12345678903"},
        {"name": "Ana Clara Costa", "birth_date": date(1999, 7, 8), "cpf": "12345678904"},
        {"name": "João Victor Alves", "birth_date": date(2002, 4, 30), "cpf": "12345678905"},
        {"name": "Beatriz Souza Lima", "birth_date": date(1997, 6, 12), "cpf": "12345678906"},
        {"name": "Rafael Martins Rocha", "birth_date": date(2000, 2, 25), "cpf": "12345678907"},
        {"name": "Isabela Ferreira Dias", "birth_date": date(1998, 8, 18), "cpf": "12345678908"},
        {"name": "Gabriel Santos Cruz", "birth_date": date(2001, 11, 5), "cpf": "12345678909"},
        {"name": "Júlia Oliveira Nunes", "birth_date": date(1999, 9, 20), "cpf": "12345678910"},
        {"name": "Matheus Henrique Barros", "birth_date": date(2000, 4, 7), "cpf": "12345678911"},
        {"name": "Letícia Andrade Lopes", "birth_date": date(1998, 6, 14), "cpf": "12345678912"},
        {"name": "Felipe Augusto Cardoso", "birth_date": date(2001, 1, 28), "cpf": "12345678913"},
        {"name": "Camila Vitória Ribeiro", "birth_date": date(1997, 10, 3), "cpf": "12345678914"},
        {"name": "Daniel Costa Machado", "birth_date": date(2000, 5, 16), "cpf": "12345678915"},
        {"name": "Laura Beatriz Pereira", "birth_date": date(1999, 3, 22), "cpf": "12345678916"},
        {"name": "Guilherme Luiz Monteiro", "birth_date": date(2002, 8, 9), "cpf": "12345678917"},
        {"name": "Sophia Helena Araújo", "birth_date": date(1998, 12, 1), "cpf": "12345678918"},
        {"name": "Enzo Gabriel Teixeira", "birth_date": date(2001, 7, 25), "cpf": "12345678919"},
        {"name": "Yasmin Cristina Moreira", "birth_date": date(1999, 2, 11), "cpf": "12345678920"},
        {"name": "Arthur Miguel Freitas", "birth_date": date(2000, 5, 30), "cpf": "12345678921"},
        {"name": "Valentina Souza Correia", "birth_date": date(1997, 9, 17), "cpf": "12345678922"},
        {"name": "Davi Lucas Fernandes", "birth_date": date(2001, 1, 6), "cpf": "12345678923"},
        {"name": "Alice Maria Carvalho", "birth_date": date(1998, 11, 23), "cpf": "12345678924"},
        {"name": "Vinícius Alexandre Barbosa", "birth_date": date(2000, 4, 14), "cpf": "12345678925"},
        {"name": "Lorena Vitória Gonçalves", "birth_date": date(1999, 6, 8), "cpf": "12345678926"},
        {"name": "Henrique Eduardo Castro", "birth_date": date(2002, 3, 19), "cpf": "12345678927"},
        {"name": "Amanda Carolina Duarte", "birth_date": date(1997, 10, 27), "cpf": "12345678928"},
        {"name": "Bruno Rafael Nogueira", "birth_date": date(2001, 7, 4), "cpf": "12345678929"},
        {"name": "Mariana Vitória Campos", "birth_date": date(1998, 2, 15), "cpf": "12345678930"}
    ]
    
    created_students = []
    for student_data in students_data:
        existing = session.query(Student).filter(Student.cpf == student_data["cpf"]).first()
        
        if not existing:
            student = Student(
                **student_data,
                email=f"aluno{student_data['cpf'][-3:]}@aluno.thehouse.edu.br",
                phone="(11) 98765-4321",
                address="São Paulo, SP",
                guardian_name="Responsável",
                guardian_phone="(11) 91234-5678",
                is_active=True
            )
            session.add(student)
            created_students.append(student)
        else:
            created_students.append(existing)
    
    session.commit()
    print(f"✅ {len(created_students)} alunos\n")
    return created_students


def seed_teachers(session, users):
    """Cria professores vinculados aos usuários"""
    print("👨‍🏫 Criando professores...")
    
    teacher_users = [u for u in users if u.role == UserRole.TEACHER]
    subjects = ["Grammar", "Conversation", "Writing", "Reading & Listening", "Business English"]
    
    created_teachers = []
    for i, user in enumerate(teacher_users):
        existing = session.query(Teacher).filter(Teacher.user_id == user.id).first()
        
        if not existing:
            # Gerar CPF sequencial
            cpf = f"9876543{str(i).zfill(4)}"
            
            teacher = Teacher(
                user_id=user.id,
                cpf=cpf,
                phone="(11) 99999-8888",
                specialty=subjects[i] if i < len(subjects) else "Geral",
                hire_date=date(2024, 1, 15)
            )
            session.add(teacher)
            created_teachers.append(teacher)
        else:
            created_teachers.append(existing)
    
    session.commit()
    print(f"✅ {len(created_teachers)} professores\n")
    return created_teachers


def seed_classes(session, teachers):
    """Cria turmas"""
    print("📚 Criando turmas...")
    
    classes_data = [
        {"name": "Beginner A1", "description": "English for complete beginners", "level": "Beginner", "teacher_idx": 0},
        {"name": "Beginner A2", "description": "Elementary English", "level": "Beginner", "teacher_idx": 1},
        {"name": "Intermediate B1", "description": "Pre-Intermediate English", "level": "Intermediate", "teacher_idx": 2},
        {"name": "Intermediate B2", "description": "Intermediate English", "level": "Intermediate", "teacher_idx": 3},
        {"name": "Advanced C1", "description": "Upper-Intermediate English", "level": "Advanced", "teacher_idx": 4},
        {"name": "Advanced C2", "description": "Advanced English", "level": "Advanced", "teacher_idx": 0}
    ]
    
    created_classes = []
    for class_data in classes_data:
        teacher_idx = class_data.pop("teacher_idx")
        teacher = teachers[teacher_idx] if teacher_idx < len(teachers) else teachers[0]
        
        existing = session.query(Class).filter(
            Class.name == class_data["name"]
        ).first()
        
        if not existing:
            class_obj = Class(
                **class_data,
                teacher_id=teacher.id,
                max_capacity=30,
                start_date=date(2024, 2, 1),
                end_date=date(2024, 12, 20),
                is_active=True
            )
            session.add(class_obj)
            created_classes.append(class_obj)
        else:
            created_classes.append(existing)
    
    session.commit()
    print(f"✅ {len(created_classes)} turmas\n")
    return created_classes


def seed_lessons(session, classes, teachers):
    """Cria aulas/lições"""
    print("📖 Criando aulas...")
    
    created_lessons = []
    base_date = date.today() - timedelta(days=30)
    
    # English lesson topics
    lesson_topics = [
        ("Grammar", "Present Simple Tense"),
        ("Grammar", "Past Simple Tense"),
        ("Vocabulary", "Daily Routines"),
        ("Conversation", "Introducing Yourself"),
        ("Reading", "Short Stories"),
        ("Writing", "Emails and Messages"),
        ("Listening", "Podcasts and Interviews"),
        ("Grammar", "Present Continuous"),
        ("Vocabulary", "Food and Restaurants"),
        ("Conversation", "Making Plans"),
        ("Reading", "News Articles"),
        ("Writing", "Formal Letters"),
        ("Listening", "Movies and TV Shows"),
        ("Grammar", "Future Tenses"),
        ("Vocabulary", "Travel and Tourism")
    ]
    
    for class_obj in classes[:3]:
        teacher = next((t for t in teachers if t.id == class_obj.teacher_id), teachers[0])
        
        topic_idx = 0
        for day_offset in range(0, 30, 2):
            lesson_date = base_date + timedelta(days=day_offset)
            
            if lesson_date.weekday() >= 5:
                continue
            
            existing = session.query(Lesson).filter(
                Lesson.class_id == class_obj.id,
                Lesson.date == lesson_date
            ).first()
            
            if not existing:
                subject, topic = lesson_topics[topic_idx % len(lesson_topics)]
                lesson = Lesson(
                    class_id=class_obj.id,
                    date=lesson_date,
                    content=f"{subject}: {topic} - Class activities and exercises completed",
                    notes=f"Students practiced {topic.lower()} through interactive activities"
                )
                session.add(lesson)
                created_lessons.append(lesson)
                topic_idx += 1
    
    session.commit()
    print(f"✅ {len(created_lessons)} aulas\n")
    return created_lessons


def seed_assessments(session, students, classes, teachers):
    """Cria avaliações"""
    print("📝 Criando avaliações...")
    
    created_assessments = []
    
    # Primeiro, criar lições se ainda não foram criadas
    base_date = date.today() - timedelta(days=30)
    lessons_map = {}
    
    for class_obj in classes[:3]:
        lessons = session.query(Lesson).filter(Lesson.class_id == class_obj.id).all()
        if lessons:
            lessons_map[class_obj.id] = lessons[:3]  # Pegaar 3 lições
    
    for class_obj in classes[:3]:
        if class_obj.id not in lessons_map:
            continue
            
        class_students = students[:5] if "A1" in class_obj.name else \
                        students[5:10] if "A2" in class_obj.name else \
                        students[10:15]
        
        assessment_types = ["Written Test", "Oral Test", "Homework", "Class Participation"]
        
        for student in class_students:
            for i, lesson in enumerate(lessons_map[class_obj.id]):
                assessment_type = assessment_types[i % len(assessment_types)]
                
                existing = session.query(Assessment).filter(
                    Assessment.student_id == student.id,
                    Assessment.lesson_id == lesson.id,
                    Assessment.type == assessment_type
                ).first()
                
                if not existing:
                    grade = round(random.uniform(6.0, 10.0), 1)
                    
                    assessment = Assessment(
                        student_id=student.id,
                        lesson_id=lesson.id,
                        type=assessment_type,
                        grade=grade,
                        weight=1.0,
                        assessment_date=lesson.date,
                        note="Avaliação regular" if grade >= 7.0 else "Necessita reforço"
                    )
                    session.add(assessment)
                    created_assessments.append(assessment)
    
    session.commit()
    print(f"✅ {len(created_assessments)} avaliações\n")
    return created_assessments


def main():
    """Função principal"""
    print("\n" + "="*60)
    print("🏫 THE HOUSE - SEED DE DADOS DE EXEMPLO")
    print("="*60 + "\n")
    
    session = SessionLocal()
    
    try:
        users = seed_users(session)
        students = seed_students(session)
        teachers = seed_teachers(session, users)
        classes = seed_classes(session, teachers)
        lessons = seed_lessons(session, classes, teachers)
        assessments = seed_assessments(session, students, classes, teachers)
        
        print("\n" + "="*60)
        print("✅ SEED CONCLUÍDO COM SUCESSO!")
        print("="*60)
        print(f"\n📊 Resumo:")
        print(f"  • {len(users)} usuários")
        print(f"  • {len(students)} alunos")
        print(f"  • {len(teachers)} professores")
        print(f"  • {len(classes)} turmas")
        print(f"  • {len(lessons)} aulas")
        print(f"  • {len(assessments)} avaliações")
        print("\n🔑 Credenciais de acesso:")
        print("  • Diretor: diretor@thehouse.edu.br / senha123")
        print("  • Pedagoga: pedagoga@thehouse.edu.br / senha123")
        print("  • Secretaria: secretaria@thehouse.edu.br / senha123")
        print("  • Professores: prof.*@thehouse.edu.br / senha123")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Erro durante o seed: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
