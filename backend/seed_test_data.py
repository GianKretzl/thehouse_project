"""
Script para popular o banco de dados com dados de teste
Inclui: Diretor, Pedagogo, Secretário, Professor Tiago, 5 turmas e 25 alunos
"""
import sys
from datetime import date, time, datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User, UserRole, Teacher, Student, Class, Schedule, Enrollment
from app.core.security import get_password_hash


def create_test_data():
    """Cria dados de teste para o sistema"""
    db = SessionLocal()
    
    try:
        print("🚀 Iniciando criação de dados de teste...")
        
        # ==================== USUÁRIOS ====================
        print("\n👥 Criando usuários do sistema...")
        
        # 1. Diretor
        director = User(
            name="Maria Silva",
            email="maria.silva@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.DIRECTOR,
            is_active=True
        )
        db.add(director)
        print("✅ Diretor(a): Maria Silva")
        
        # 2. Pedagogo
        pedagogue = User(
            name="Carlos Oliveira",
            email="carlos.oliveira@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.PEDAGOGUE,
            is_active=True
        )
        db.add(pedagogue)
        print("✅ Pedagogo(a): Carlos Oliveira")
        
        # 3. Secretário
        secretary = User(
            name="Ana Costa",
            email="ana.costa@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.SECRETARY,
            is_active=True
        )
        db.add(secretary)
        print("✅ Secretário(a): Ana Costa")
        
        # 4. Professor Tiago
        teacher_user = User(
            name="Tiago Rodrigues",
            email="tiago.rodrigues@thehouse.com.br",
            hashed_password=get_password_hash("senha123"),
            role=UserRole.TEACHER,
            is_active=True
        )
        db.add(teacher_user)
        db.flush()  # Obter ID do usuário
        
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
        
        # ==================== TURMAS ====================
        print("\n📚 Criando turmas de inglês...")
        
        turmas_info = [
            {
                "name": "Beginner A1 - Morning",
                "level": "Beginner A1",
                "description": "Turma para iniciantes absolutos em inglês",
                "weekday": 0,  # Segunda
                "start_time": time(8, 0),
                "end_time": time(10, 0),
                "room": "Sala 101"
            },
            {
                "name": "Elementary A2 - Afternoon",
                "level": "Elementary A2",
                "description": "Inglês básico com foco em conversação",
                "weekday": 1,  # Terça
                "start_time": time(14, 0),
                "end_time": time(16, 0),
                "room": "Sala 102"
            },
            {
                "name": "Pre-Intermediate B1 - Evening",
                "level": "Pre-Intermediate B1",
                "description": "Desenvolvimento de habilidades intermediárias",
                "weekday": 2,  # Quarta
                "start_time": time(18, 30),
                "end_time": time(20, 30),
                "room": "Sala 103"
            },
            {
                "name": "Intermediate B2 - Morning",
                "level": "Intermediate B2",
                "description": "Inglês intermediário com foco em fluência",
                "weekday": 3,  # Quinta
                "start_time": time(9, 0),
                "end_time": time(11, 0),
                "room": "Sala 104"
            },
            {
                "name": "Advanced C1 - Evening",
                "level": "Advanced C1",
                "description": "Inglês avançado para proficiência",
                "weekday": 4,  # Sexta
                "start_time": time(19, 0),
                "end_time": time(21, 0),
                "room": "Sala 105"
            }
        ]
        
        classes = []
        start_date = date.today()
        end_date = start_date + timedelta(days=180)  # 6 meses
        
        for turma_info in turmas_info:
            turma = Class(
                name=turma_info["name"],
                description=turma_info["description"],
                level=turma_info["level"],
                teacher_id=teacher.id,
                max_capacity=15,
                start_date=start_date,
                end_date=end_date,
                is_active=True
            )
            db.add(turma)
            db.flush()
            
            # Criar horário da turma
            schedule = Schedule(
                class_id=turma.id,
                weekday=turma_info["weekday"],
                start_time=turma_info["start_time"],
                end_time=turma_info["end_time"],
                room=turma_info["room"]
            )
            db.add(schedule)
            
            classes.append(turma)
            
            weekdays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
            print(f"✅ {turma.name} - {weekdays[turma_info['weekday']]} {turma_info['start_time'].strftime('%H:%M')}-{turma_info['end_time'].strftime('%H:%M')}")
        
        db.commit()
        
        # ==================== ALUNOS ====================
        print("\n👨‍🎓 Criando 25 alunos (5 por turma)...")
        
        nomes_alunos = [
            # Turma 1
            ["João Pedro Silva", "Maria Eduarda Santos", "Lucas Ferreira", "Ana Clara Costa", "Pedro Henrique Souza"],
            # Turma 2
            ["Julia Oliveira", "Gabriel Almeida", "Isabella Rodrigues", "Rafael Lima", "Laura Martins"],
            # Turma 3
            ["Matheus Carvalho", "Sophia Ribeiro", "Felipe Gomes", "Valentina Dias", "Bruno Cardoso"],
            # Turma 4
            ["Letícia Araujo", "Vinicius Pereira", "Camila Fernandes", "Gustavo Barbosa", "Mariana Castro"],
            # Turma 5
            ["Daniel Rocha", "Beatriz Alves", "Arthur Monteiro", "Lorena Correia", "Henrique Teixeira"]
        ]
        
        for idx, turma in enumerate(classes):
            print(f"\n  📖 Matriculando alunos na turma: {turma.name}")
            
            for aluno_idx, nome in enumerate(nomes_alunos[idx]):
                cpf_base = f"{idx}{aluno_idx:02d}00000000"
                cpf = cpf_base[:11]
                
                # Calcular idade baseada no nível (Beginner = mais jovens, Advanced = mais velhos)
                base_age = 18 + (idx * 5)
                birth_year = datetime.now().year - (base_age + aluno_idx)
                
                student = Student(
                    name=nome,
                    email=f"{nome.lower().replace(' ', '.')}@email.com",
                    cpf=cpf,
                    birth_date=date(birth_year, 1 + (aluno_idx % 12), 15),
                    phone=f"(41) 9{8000 + (idx * 100) + aluno_idx:04d}-{1000 + aluno_idx:04d}",
                    address=f"Rua Exemplo, {100 + (idx * 10) + aluno_idx} - São José dos Pinhais, PR",
                    guardian_name=f"Responsável de {nome.split()[0]}",
                    guardian_phone=f"(41) 9{7000 + (idx * 100) + aluno_idx:04d}-{2000 + aluno_idx:04d}",
                    is_active=True
                )
                db.add(student)
                db.flush()
                
                # Matricular na turma
                enrollment = Enrollment(
                    student_id=student.id,
                    class_id=turma.id,
                    enrollment_date=start_date - timedelta(days=10),
                    is_active=True
                )
                db.add(enrollment)
                
                print(f"    ✅ {nome}")
        
        db.commit()
        
        # ==================== RESUMO ====================
        print("\n" + "="*60)
        print("✨ DADOS DE TESTE CRIADOS COM SUCESSO! ✨")
        print("="*60)
        print("\n📊 RESUMO:")
        print(f"  • 1 Diretor(a): Maria Silva")
        print(f"  • 1 Pedagogo(a): Carlos Oliveira")
        print(f"  • 1 Secretário(a): Ana Costa")
        print(f"  • 1 Professor: Tiago Rodrigues")
        print(f"  • 5 Turmas de inglês (Beginner ao Advanced)")
        print(f"  • 25 Alunos (5 por turma)")
        print(f"  • 5 Horários configurados")
        print(f"  • 25 Matrículas ativas")
        
        print("\n🔑 CREDENCIAIS DE ACESSO:")
        print("  Todos os usuários têm senha: senha123")
        print("\n  📧 Diretor(a):")
        print("     Email: maria.silva@thehouse.com.br")
        print("\n  📧 Pedagogo(a):")
        print("     Email: carlos.oliveira@thehouse.com.br")
        print("\n  📧 Secretário(a):")
        print("     Email: ana.costa@thehouse.com.br")
        print("\n  📧 Professor:")
        print("     Email: tiago.rodrigues@thehouse.com.br")
        
        print("\n📚 TURMAS CRIADAS:")
        for i, turma in enumerate(classes):
            weekdays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
            schedule = turma.schedules[0]
            print(f"\n  {i+1}. {turma.name}")
            print(f"     Nível: {turma.level}")
            print(f"     Horário: {weekdays[schedule.weekday]} {schedule.start_time.strftime('%H:%M')}-{schedule.end_time.strftime('%H:%M')}")
            print(f"     Sala: {schedule.room}")
            print(f"     Alunos: {len(turma.enrollments)}")
        
        print("\n" + "="*60)
        print("🎯 Próximos passos:")
        print("  1. Inicie o backend: uvicorn app.main:app --reload")
        print("  2. Acesse: http://localhost:8000/api/v1/docs")
        print("  3. Faça login com qualquer usuário acima")
        print("  4. Teste as funcionalidades do sistema")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Erro ao criar dados: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🏫 The House Institute - Seed de Dados de Teste")
    print("="*60)
    
    # Verificar se as tabelas existem
    try:
        create_test_data()
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        print("\n💡 Certifique-se de que:")
        print("  1. O PostgreSQL está rodando")
        print("  2. As migrações foram aplicadas (alembic upgrade head)")
        print("  3. O arquivo .env está configurado corretamente")
        sys.exit(1)
