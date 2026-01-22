"""
Script para resetar o banco de dados de produção
ATENÇÃO: Isso vai DELETAR TODOS OS DADOS!
"""
import os
from sqlalchemy import create_engine, text

# URL do banco de produção
DATABASE_URL = "postgresql://thehouse_institute_user:0fTwEX5YGS8vCzeRG2n9zUjQvMWvkRio@dpg-d5i0qsm3jp1c73f1bu30-a.ohio-postgres.render.com/thehouse_institute"

def reset_database():
    print("⚠️  ATENÇÃO: Isso vai DELETAR TODOS OS DADOS do banco de produção!")
    confirm = input("Digite 'SIM' para confirmar: ")
    
    if confirm != "SIM":
        print("❌ Operação cancelada.")
        return
    
    print("\n🔄 Conectando ao banco...")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            print("🗑️  Deletando todas as tabelas...")
            
            # Drop todas as tabelas em ordem reversa (respeitando foreign keys)
            tables = [
                'material_reservations',
                'events',
                'announcements',
                'assessments',
                'attendances',
                'lessons',
                'enrollments',
                'students',
                'classes',
                'users',
                'alembic_version'
            ]
            
            for table in tables:
                try:
                    conn.execute(text(f'DROP TABLE IF EXISTS {table} CASCADE'))
                    conn.commit()
                    print(f"  ✅ Deletado: {table}")
                except Exception as e:
                    print(f"  ⚠️  {table}: {e}")
            
            print("\n✅ Banco resetado com sucesso!")
            print("\n📝 Próximos passos:")
            print("1. Execute: alembic upgrade head")
            print("2. Execute: python seed_test_data.py")
            
    except Exception as e:
        print(f"\n❌ Erro: {e}")
    finally:
        engine.dispose()

if __name__ == "__main__":
    reset_database()
