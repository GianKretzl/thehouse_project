"""
Script COMPLETO para popular o banco de dados com dados de teste
Inclui: Usuários, Turmas com Horários, Alunos Matriculados, Eventos e Reservas
Execute: python seed_test_data.py
"""
import sys
import os
from datetime import date, time, datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import User, UserRole, Teacher, Student, Class, Schedule, Enrollment, Event, MaterialReservation
from app.core.security import get_password_hash


def create_test_data():
    """Cria dados completos de teste para o sistema"""
    db = SessionLocal()
    
    try:
        today = date.today()
        
        print("🚀 Iniciando criação de dados de teste...")
        print("="*60)
        
        # ==================== VERIFICAR SE JÁ EXISTEM DADOS ====================
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"\n⚠️  Banco já possui {existing_users} usuários")
            print("🔄 Pulando criação de dados - banco já populado")
            print("\n💡 Para resetar: delete todos os registros ou use reset_production_db.py")
            return
        
        # ==================== USUÁRIOS ====================
        print("\n👥 Criando usuários do sistema...")
        
        director = User(
            name="Maria Silva",
            email="maria.silva@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.DIRECTOR,
            is_active=True
        )
        db.add(director)
        print("✅ Diretor(a): Maria Silva")
        
        coordinator = User(
            name="Carlos Oliveira",
            email="carlos.oliveira@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.COORDINATOR,
            is_active=True
        )
        db.add(coordinator)
        print("✅ Coordenador(a): Carlos Oliveira")
        
        secretary = User(
            name="Ana Costa",
            email="ana.costa@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.SECRETARY,
            is_active=True
        )
        db.add(secretary)
        print("✅ Secretário(a): Ana Costa")
        
        teacher_user = User(
            name="Tiago Rodrigues",
            email="tiago.rodrigues@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.TEACHER,
            is_active=True
        )
        db.add(teacher_user)
        db.flush()
        
        teacher = Teacher(
            user_id=teacher_user.id,
            cpf="12345678901",
            phone="(41) 99999-1234",
            specialty="English Teaching - All Levels",
            hire_date=date(2024, 1, 15)
        )
        db.add(teacher)
        print("✅ Professor: Tiago Rodrigues")
        
        db.commit()
        db.refresh(teacher)
        
        # ==================== TURMAS COM HORÁRIOS ====================
        print("\n📚 Criando turmas de inglês (Kids 🔴 e Adults 🔵)...")
        
        # TURMAS KIDS 🔴 (Crianças 7-12 anos) - English Adventure
        turmas_kids = [
            {"name": "K1 - English Adventure 1", "level": "Beginner A1", "description": "🔴 Kids - Nível 1 com atividades lúdicas", 
             "weekday": 0, "start_time": time(8, 0), "end_time": time(9, 30), "room": "Sala Kids 1"},
            {"name": "K2 - English Adventure 2", "level": "Elementary A2", "description": "🔴 Kids - Nível 2 com jogos educativos", 
             "weekday": 1, "start_time": time(8, 0), "end_time": time(9, 30), "room": "Sala Kids 1"},
            {"name": "K3 - English Adventure 3", "level": "Pre-Intermediate B1", "description": "🔴 Kids - Nível 3 intermediário", 
             "weekday": 2, "start_time": time(14, 0), "end_time": time(15, 30), "room": "Sala Kids 2"},
            {"name": "K4 - English Adventure 4", "level": "Intermediate B2", "description": "🔴 Kids - Nível 4 avançando", 
             "weekday": 3, "start_time": time(14, 0), "end_time": time(15, 30), "room": "Sala Kids 2"},
            {"name": "K5 - English Adventure 5", "level": "Upper-Intermediate B2", "description": "🔴 Kids - Nível 5 fluência infantil", 
             "weekday": 4, "start_time": time(8, 0), "end_time": time(9, 30), "room": "Sala Kids 3"},
        ]
        
        # TURMAS ADULTS 🔵 (Adolescentes 13+ e Adultos) - InstaEnglish
        turmas_adults = [
            {"name": "A1 - InstaEnglish Starter", "level": "Beginner A1", "description": "🔵 Adults - Iniciantes absolutos", 
             "weekday": 0, "start_time": time(18, 30), "end_time": time(20, 30), "room": "Sala 101"},
            {"name": "A2 - InstaEnglish 1", "level": "Elementary A2", "description": "🔵 Adults - Nível básico", 
             "weekday": 1, "start_time": time(18, 30), "end_time": time(20, 30), "room": "Sala 102"},
            {"name": "A3 - InstaEnglish 2", "level": "Pre-Intermediate B1", "description": "🔵 Adults - Pré-intermediário", 
             "weekday": 2, "start_time": time(19, 0), "end_time": time(21, 0), "room": "Sala 103"},
            {"name": "A4 - InstaEnglish 3", "level": "Intermediate B2", "description": "🔵 Adults - Intermediário", 
             "weekday": 3, "start_time": time(19, 0), "end_time": time(21, 0), "room": "Sala 104"},
            {"name": "A5 - InstaEnglish 4", "level": "Advanced C1", "description": "🔵 Adults - Avançado para proficiência", 
             "weekday": 4, "start_time": time(19, 0), "end_time": time(21, 0), "room": "Sala 105"},
        ]
        
        turmas_info = turmas_kids + turmas_adults
        
        classes = []
        weekdays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
        
        for info in turmas_info:
            turma = Class(
                name=info["name"], description=info["description"], level=info["level"],
                teacher_id=teacher.id, max_capacity=15, start_date=today,
                end_date=today + timedelta(days=180), is_active=True
            )
            db.add(turma)
            db.flush()
            
            schedule = Schedule(
                class_id=turma.id, weekday=info["weekday"],
                start_time=info["start_time"], end_time=info["end_time"], room=info["room"]
            )
            db.add(schedule)
            classes.append(turma)
            
            print(f"✅ {turma.name}")
            print(f"   📍 {info['room']} | ⏰ {weekdays[info['weekday']]} {info['start_time'].strftime('%H:%M')}-{info['end_time'].strftime('%H:%M')}")
        
        db.commit()
        
        # ==================== ALUNOS ====================
        print("\n👨‍🎓 Criando alunos (Kids 🔴 e Adults 🔵)...")
        
        # Nomes para turmas KIDS 🔴 (crianças 7-12 anos)
        nomes_kids = [
            ["Miguel Santos", "Sofia Oliveira", "Arthur Costa", "Helena Silva", "Davi Ferreira"],
            ["Alice Martins", "Enzo Pereira", "Laura Souza", "Bernardo Lima", "Valentina Alves"],
            ["Lorenzo Rodrigues", "Isabella Gomes", "Heitor Barbosa", "Manuela Dias", "Theo Cardoso"],
            ["Luiza Araujo", "Gabriel Monteiro", "Cecília Castro", "Samuel Teixeira", "Antonella Correia"],
            ["Pedro Lucas Silva", "Maria Clara Souza", "Matheus Rocha", "Giovanna Alves", "Nicolas Ferreira"],
        ]
        
        # Nomes para turmas ADULTS 🔵 (adolescentes e adultos 13+)
        nomes_adults = [
            ["João Pedro Silva", "Maria Eduarda Santos", "Lucas Ferreira", "Ana Clara Costa", "Pedro Henrique Souza"],
            ["Julia Oliveira", "Rafael Almeida", "Camila Rodrigues", "Gustavo Lima", "Mariana Martins"],
            ["Felipe Carvalho", "Sophia Ribeiro", "Vinicius Gomes", "Letícia Dias", "Bruno Cardoso"],
            ["Beatriz Araujo", "Matheus Pereira", "Carolina Fernandes", "Daniel Barbosa", "Larissa Castro"],
            ["André Rocha", "Isabela Alves", "Ricardo Monteiro", "Fernanda Correia", "Thiago Teixeira"],
        ]
        
        nomes = nomes_kids + nomes_adults
        
        for idx, turma in enumerate(classes):
            print(f"\n  📖 {turma.name}")
            
            # Determina se é turma Kids ou Adults e define idade base
            is_kids = "Kids" in turma.name
            birth_year_base = 2016 if is_kids else 2002  # Kids: 8-10 anos, Adults: 20-24 anos
            
            for aluno_idx, nome in enumerate(nomes[idx]):
                # Ajusta idade conforme tipo de turma
                birth_year = birth_year_base - (aluno_idx % 3)
                
                aluno = Student(
                    name=nome, cpf=f"{idx}{aluno_idx:02d}00000000"[:11],
                    birth_date=date(birth_year, (aluno_idx % 12) + 1, (aluno_idx % 28) + 1),
                    phone=f"(41) 99{idx}{aluno_idx:02d}-{idx*100+aluno_idx:04d}",
                    guardian_name=f"Responsável de {nome.split()[0]}" if is_kids else None,
                    guardian_phone=f"(41) 98{idx}{aluno_idx:02d}-{idx*100+aluno_idx:04d}" if is_kids else None,
                    is_active=True
                )
                db.add(aluno)
                db.flush()
                
                db.add(Enrollment(student_id=aluno.id, class_id=turma.id, enrollment_date=today, is_active=True))
                age = today.year - birth_year
                print(f"    • {nome} ({age} anos)")
        
        db.commit()
        
        # ==================== EVENTOS E RESERVAS ====================
        print("\n📅 Criando eventos...")
        
        eventos = [
            {"title": "Reunião Pedagógica", "description": "Discussão estratégias", "event_date": today + timedelta(3),
             "start_time": time(14,0), "end_time": time(16,0), "location": "Sala Reuniões", "event_type": "meeting", "created_by": director.id},
            {"title": "Workshop Metodologias", "description": "Formação continuada", "event_date": today + timedelta(7),
             "start_time": time(9,0), "end_time": time(17,0), "location": "Auditório", "event_type": "meeting", "created_by": director.id},
            {"title": "Período Avaliações", "description": "Semana de provas", "event_date": today + timedelta(14),
             "event_type": "exam", "created_by": secretary.id},
            {"title": f"Prova Grammar - {classes[0].name}", "description": "Avaliação gramática", "event_date": today + timedelta(10),
             "start_time": time(8,0), "end_time": time(10,0), "location": "Sala 101", "class_id": classes[0].id,
             "event_type": "exam", "created_by": teacher_user.id}
        ]
        
        for e in eventos:
            db.add(Event(**e))
            print(f"  ✓ {e['title']}")
        
        print("\n📦 Criando reservas...")
        
        reservas = [
            {"material_name": "Projetor Multimídia", "description": "Slides", "reservation_date": today + timedelta(1),
             "start_time": time(8,0), "end_time": time(10,0), "quantity": 1, "location": "Sala 101",
             "class_id": classes[0].id, "reserved_by": teacher_user.id, "status": "confirmed"},
            {"material_name": "Caixa de Som", "description": "Listening", "reservation_date": today + timedelta(3),
             "start_time": time(14,0), "end_time": time(16,0), "quantity": 1, "location": "Sala 102",
             "class_id": classes[1].id, "reserved_by": teacher_user.id, "status": "confirmed"},
            {"material_name": "Kit Flashcards", "description": "Vocabulário", "reservation_date": today + timedelta(5),
             "start_time": time(18,30), "end_time": time(20,30), "quantity": 2, "location": "Sala 103",
             "reserved_by": teacher_user.id, "status": "pending"}
        ]
        
        for r in reservas:
            db.add(MaterialReservation(**r))
            print(f"  ✓ {r['material_name']}")
        
        db.commit()
        
        # ==================== RESUMO ====================
        print("\n" + "="*60)
        print("✨ BANCO DE DADOS POPULADO COM SUCESSO! ✨")
        print("="*60)
        print("\n📊 RESUMO:")
        print("  👥 4 Usuários (Diretor, Coordenador, Secretário, Professor)")
        print("  📚 10 Turmas:")
        print("     🔴 Kids: K1-K5 (English Adventure 1-5)")
        print("     🔵 Adults: A1-A5 (InstaEnglish Starter-4)")
        print("  👨‍🎓 50 Alunos matriculados (5 por turma)")
        print("  📅 4 Eventos + 3 Reservas de material")
        print("\n🔑 CREDENCIAIS (senha: senha123):")
        print("  📧 maria.silva@thehouse.com.br      (Diretor)")
        print("  📧 carlos.oliveira@thehouse.com.br  (Coordenador)")
        print("  📧 ana.costa@thehouse.com.br        (Secretário)")
        print("  📧 tiago.rodrigues@thehouse.com.br  (Professor)")
        print("\n🎯 Inicie: uvicorn app.main:app --reload")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🏫 The House Institute - Seed Completo")
    print("="*60)
    try:
        create_test_data()
    except Exception as e:
        print(f"\n💡 Verifique: PostgreSQL rodando + migrações aplicadas + .env configurado")
        sys.exit(1)
