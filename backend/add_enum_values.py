"""
Script para adicionar novos valores ao enum userrole
"""
from sqlalchemy import text
from app.core.database import engine


def add_enum_values():
    try:
        with engine.connect() as conn:
            # Verificar valores atuais
            result = conn.execute(text("SELECT unnest(enum_range(NULL::userrole))"))
            current_values = [row[0] for row in result]
            print(f"Valores atuais do enum: {current_values}")
        
        # Adicionar novos valores (precisa ser fora da transação)
        new_values = ['DIRECTOR', 'PEDAGOGUE', 'SECRETARY']
        
        for value in new_values:
            if value not in current_values:
                print(f"Adicionando valor: {value}")
                with engine.connect() as conn:
                    conn.execute(text(f"ALTER TYPE userrole ADD VALUE '{value}'"))
                    conn.commit()
            else:
                print(f"Valor {value} já existe")
        
        # Verificar valores finais
        with engine.connect() as conn:
            result = conn.execute(text("SELECT unnest(enum_range(NULL::userrole))"))
            final_values = [row[0] for row in result]
            print(f"\nValores finais do enum: {final_values}")
        
        print("\n✅ Enum atualizado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")


if __name__ == "__main__":
    add_enum_values()
