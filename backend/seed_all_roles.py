"""
Script para criar usuários de teste para todos os papéis do sistema
"""
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import User, UserRole, Teacher


def seed_all_roles():
    db = SessionLocal()
    
    try:
        print("🌱 Criando usuários para todos os papéis...")
        
        users_to_create = [
            {
                "name": "Maria Diretora",
                "email": "diretor@teste.com",
                "password": "diretor123",
                "role": UserRole.DIRECTOR
            },
            {
                "name": "João Pedagogo",
                "email": "pedagogo@teste.com",
                "password": "pedagogo123",
                "role": UserRole.PEDAGOGUE
            },
            {
                "name": "Ana Secretária",
                "email": "secretaria@teste.com",
                "password": "secretaria123",
                "role": UserRole.SECRETARY
            },
            {
                "name": "Tiago Professor",
                "email": "professor@teste.com",
                "password": "professor123",
                "role": UserRole.TEACHER
            }
        ]
        
        for user_data in users_to_create:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing:
                print(f"⚠️  Usuário {user_data['email']} já existe, atualizando role...")
                existing.role = user_data["role"]
                db.commit()
            else:
                new_user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
                # Se for professor, criar perfil
                if user_data["role"] == UserRole.TEACHER:
                    teacher_profile = Teacher(
                        user_id=new_user.id,
                        cpf="98765432100",
                        phone="(41) 98888-8888",
                        specialty="Matemática",
                        hire_date=None
                    )
                    db.add(teacher_profile)
                    db.commit()
                
                print(f"✅ Usuário {user_data['email']} criado com role {user_data['role'].value}")
        
        # Atualizar usuários antigos se ADMIN ainda existir no enum
        # Como ADMIN foi removido, converter diretamente para DIRECTOR
        old_admin = db.query(User).filter(User.email == "admin@teste.com").first()
        if old_admin:
            print(f"✅ Usuário admin@teste.com já existe como {old_admin.role.value}")
        
        old_teacher = db.query(User).filter(User.email == "tiago@teste.com").first()
        if old_teacher:
            print(f"✅ Usuário tiago@teste.com já existe como {old_teacher.role.value}")
        
        print("\n" + "="*70)
        print("✅ SEED CONCLUÍDO COM SUCESSO!")
        print("="*70)
        print("\n📋 Usuários disponíveis:")
        print("\n1. DIRETOR(A)")
        print("   Email: diretor@teste.com")
        print("   Senha: diretor123")
        print("   Funções: Gestão completa, calendário, divisão turmas, relatórios")
        
        print("\n2. PEDAGOGO(A)")
        print("   Email: pedagogo@teste.com")
        print("   Senha: pedagogo123")
        print("   Funções: Acompanhamento pedagógico, frequência, avaliações")
        
        print("\n3. SECRETÁRIO(A)")
        print("   Email: secretaria@teste.com")
        print("   Senha: secretaria123")
        print("   Funções: Cadastros, divisão turmas, grade horária")
        
        print("\n4. PROFESSOR(A)")
        print("   Email: professor@teste.com")
        print("   Senha: professor123")
        print("   Funções: Registro de frequência, conteúdo, notas")
        
        print("\n5. PROFESSOR(A) - Tiago")
        print("   Email: tiago@teste.com")
        print("   Senha: tiago123")
        
        print("\n6. ADMIN (agora DIRETOR)")
        print("   Email: admin@teste.com")
        print("   Senha: admin123")
        
        print("\n⚠️  IMPORTANTE: Altere as senhas após o primeiro login!")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_all_roles()
