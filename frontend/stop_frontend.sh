#!/bin/bash
# Script para parar o frontend

echo "🛑 Parando NetSaber Frontend..."

# Ler PID do arquivo
if [ -f logs/frontend.pid ]; then
    PID=$(cat logs/frontend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "📍 Encontrado processo com PID: $PID"
        kill $PID
        echo "✅ Frontend parado com sucesso!"
        rm logs/frontend.pid
    else
        echo "⚠️  Processo não encontrado. Limpando PID file..."
        rm logs/frontend.pid
    fi
else
    # Tentar encontrar pela porta
    EXISTING_PID=$(lsof -t -i:3000 2>/dev/null)
    if [ ! -z "$EXISTING_PID" ]; then
        echo "📍 Encontrado processo na porta 3000 (PID: $EXISTING_PID)"
        kill $EXISTING_PID
        echo "✅ Frontend parado com sucesso!"
    else
        echo "ℹ️  Nenhum processo encontrado na porta 3000"
    fi
fi
