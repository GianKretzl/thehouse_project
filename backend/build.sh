#!/usr/bin/env bash
# Build script for Render

set -o errexit

echo "📦 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔄 Executando migrações do banco..."
alembic upgrade head

echo "✅ Build concluído!"
