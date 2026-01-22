#!/usr/bin/env bash
# Build script for Render

set -o errexit

echo "📦 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔄 Executando migrações do banco..."
alembic upgrade head

# Seed não é necessário em produção - dados já existem
# Para recriar dados, rode manualmente: python seed_test_data.py

echo "✅ Build concluído!"
