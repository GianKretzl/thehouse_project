#!/bin/bash
# Script para iniciar o frontend em background de forma persistente

echo "🚀 Iniciando The House Frontend..."

# Verificar se já existe processo na porta 3000
EXISTING_PID=$(lsof -t -i:3000 2>/dev/null)
if [ ! -z "$EXISTING_PID" ]; then
    echo "⚠️  Processo existente encontrado (PID: $EXISTING_PID). Encerrando..."
    kill $EXISTING_PID 2>/dev/null
    sleep 2
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Iniciar o frontend em background
echo "📦 Iniciando Next.js em background..."
nohup pnpm dev > logs/frontend.log 2>&1 &

# Pegar o PID do processo
FRONTEND_PID=$!
echo "✅ Frontend iniciado com PID: $FRONTEND_PID"

# Aguardar alguns segundos
echo "⏳ Aguardando inicialização..."
sleep 10

# Testar se está respondendo
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend está respondendo corretamente!"
    echo ""
    echo "📍 URLs disponíveis:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000"
    echo ""
    echo "📝 Logs em: logs/frontend.log"
    echo "🔍 Para ver logs: tail -f logs/frontend.log"
    echo "🛑 Para parar: kill $FRONTEND_PID"
    echo ""
    echo "$FRONTEND_PID" > logs/frontend.pid
    echo "💡 PID salvo em: logs/frontend.pid"
else
    echo "❌ Erro ao iniciar o frontend. Verifique os logs:"
    echo "   tail -20 logs/frontend.log"
    exit 1
fi
