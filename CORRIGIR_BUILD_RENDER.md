# 🔧 Corrigir Build Command no Render

## ❌ Problema
O Render está usando comando antigo que inclui `python seed_test_data.py`, causando erro de chave duplicada.

## ✅ Solução (2 Opções)

### **Opção 1: Atualizar no Dashboard (RECOMENDADO)**

1. **Acesse o Dashboard do Render:**
   ```
   https://dashboard.render.com/web/thehouse-backend
   ```

2. **Vá em Settings:**
   - Clique na aba **"Settings"**
   - Role até **"Build & Deploy"**

3. **Edite o Build Command:**
   
   **REMOVA isto:**
   ```bash
   pip install --upgrade pip && pip install -r requirements.txt && alembic upgrade head && python seed_test_data.py
   ```
   
   **SUBSTITUA por:**
   ```bash
   ./build.sh
   ```

4. **Salve as alterações:**
   - Clique em **"Save Changes"**

5. **Force um novo deploy:**
   - Vá para a aba **"Manual Deploy"**
   - Clique em **"Clear build cache & deploy"**

---

### **Opção 2: Deletar e Recriar (Se opção 1 não funcionar)**

1. **Deletar serviço existente:**
   ```
   Dashboard → thehouse-backend → Settings → Delete Web Service
   ```

2. **Recriar usando Blueprint:**
   ```
   Dashboard → New + → Blueprint
   Selecione: GianKretzl/thehouse_project
   Branch: main
   ```

3. **Render vai usar o `render.yaml` atualizado** ✅

---

## 📋 O que o build.sh faz

```bash
#!/usr/bin/env bash
set -o errexit

echo "📦 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔄 Executando migrações do banco..."
alembic upgrade head

# ✅ SEM python seed_test_data.py

echo "✅ Build concluído!"
```

---

## 🎯 Resultado Esperado

Após a correção, o build deve:
1. ✅ Instalar dependências
2. ✅ Aplicar migrações (com índices de performance)
3. ✅ **NÃO** executar seed
4. ✅ Iniciar servidor com sucesso

---

## ⚠️ Por que isso aconteceu?

O Render **não atualiza automaticamente** as configurações de serviços existentes quando você altera o `render.yaml`. 

**Comportamento do Render:**
- **Novo serviço:** Usa `render.yaml` ✅
- **Serviço existente:** Usa config salva no dashboard ⚠️

---

## 🚀 Verificar Deploy

Após corrigir, monitore o build:
```
https://dashboard.render.com/web/thehouse-backend
```

Deve ver:
```
📦 Instalando dependências...
Successfully installed fastapi-0.115.0...
🔄 Executando migrações do banco...
INFO [alembic.runtime.migration] Running upgrade...
✅ Build concluído!
```

**SEM** a linha de seed que causa erro!

---

## 📞 Precisa de Ajuda?

Se ainda estiver com problemas:
1. Verifique que o arquivo `backend/build.sh` tem permissão de execução
2. Confirme que não há `python seed_test_data.py` no comando
3. Tente limpar o cache: **"Clear build cache & deploy"**
