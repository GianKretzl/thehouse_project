"""
Script para criar o primeiro usuário administrador
"""
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import User, UserRole


def create_admin():
    db = SessionLocal()
    
    try:
        # Verificar se já existe um admin
        existing_admin = db.query(User).filter(User.email == "admin@thehouse.com.br").first()
        
        if existing_admin:
            print("Usuário admin já existe!")
            return
        
        # Criar novo admin
        admin_user = User(
            name="Administrador",
            email="admin@thehouse.com.br",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Usuário administrador criado com sucesso!")
        print(f"Email: {admin_user.email}")
        print("Senha: admin123")
        print("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
        
    except Exception as e:
        print(f"❌ Erro ao criar administrador: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
