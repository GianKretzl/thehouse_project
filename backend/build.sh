#!/usr/bin/env bash
# Build script for Render

set -o errexit

echo "📦 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔄 Executando migrações do banco..."
alembic upgrade head

echo "🌱 Populando banco com dados de teste..."
python seed_test_data.py

echo "✅ Build concluído!"
