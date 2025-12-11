"""
Script para criar usuários de teste no banco de dados
"""
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import User, UserRole, Teacher


def seed_users():
    db = SessionLocal()
    
    try:
        print("🌱 Iniciando seed do banco de dados...")
        
        # Verificar se já existem usuários
        existing_admin = db.query(User).filter(User.email == "admin@teste.com").first()
        existing_prof = db.query(User).filter(User.email == "tiago@teste.com").first()
        
        if existing_admin and existing_prof:
            print("✅ Usuários de teste já existem!")
            return
        
        # Criar usuário Admin
        if not existing_admin:
            admin_user = User(
                name="Administrador",
                email="admin@teste.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print("✅ Usuário Admin criado!")
        
        # Criar usuário Professor
        if not existing_prof:
            teacher_user = User(
                name="Tiago Silva",
                email="tiago@teste.com",
                hashed_password=get_password_hash("tiago123"),
                role=UserRole.TEACHER,
                is_active=True
            )
            db.add(teacher_user)
            db.commit()
            db.refresh(teacher_user)
            
            # Criar perfil de professor
            teacher_profile = Teacher(
                user_id=teacher_user.id,
                cpf="12345678901",
                phone="(41) 99999-9999",
                specialty="Inglês Avançado",
                hire_date=None
            )
            db.add(teacher_profile)
            print("✅ Usuário Professor criado!")
        
        db.commit()
        
        print("\n" + "="*50)
        print("✅ SEED CONCLUÍDO COM SUCESSO!")
        print("="*50)
        print("\n📋 Usuários criados:")
        print("\n1. ADMINISTRADOR")
        print("   Email: admin@teste.com")
        print("   Senha: admin123")
        print("\n2. PROFESSOR")
        print("   Email: tiago@teste.com")
        print("   Senha: tiago123")
        print("\n⚠️  IMPORTANTE: Altere as senhas após o primeiro login!")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
