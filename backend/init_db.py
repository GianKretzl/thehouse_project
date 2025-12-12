"""
Script para criar todas as tabelas e popular o banco
"""
import sys
import os

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import *  # Importa todos os models

print("🔧 Criando todas as tabelas...")
Base.metadata.create_all(bind=engine)
print("✅ Tabelas criadas com sucesso!")

print("\n🌱 Iniciando seed de dados...")
os.system(f"{sys.executable} seed_sample_data.py")
