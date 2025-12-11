"""
Script para converter todos os usuários ADMIN para DIRECTOR
"""
from sqlalchemy import text
from app.core.database import engine


try:
    with engine.connect() as conn:
        # Atualizar usuários ADMIN para DIRECTOR
        result = conn.execute(text("UPDATE users SET role = 'DIRECTOR' WHERE role = 'ADMIN'"))
        conn.commit()
        print(f"✅ {result.rowcount} usuários convertidos de ADMIN para DIRECTOR")
        
        # Mostrar todos os usuários
        result = conn.execute(text("SELECT email, role FROM users ORDER BY role, email"))
        print("\n📋 Usuários atuais:")
        for row in result:
            print(f"  {row[0]:30} -> {row[1]}")
            
except Exception as e:
    print(f"❌ Erro: {e}")
