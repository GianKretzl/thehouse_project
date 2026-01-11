# 🚀 Deploy no Render - The House Institute Platform

## 📋 Pré-requisitos

1. **Conta no Render**: Criar conta gratuita em [https://render.com](https://render.com)
2. **Repositório GitHub**: Push do código para um repositório público ou privado
3. **Git instalado** e projeto versionado

---

## 🎯 Passo a Passo Completo

### **ETAPA 1: Preparar o Repositório Git** 

```bash
# No diretório raiz do projeto (thehouse_project/)
git init
git add .
git commit -m "Initial commit - The House Platform"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USUARIO/thehouse_project.git
git branch -M main
git push -u origin main
```

---

### **ETAPA 2: Criar PostgreSQL Database**

1. **Login no Render** → [https://dashboard.render.com](https://dashboard.render.com)

2. **New +** → **PostgreSQL**

3. **Configurações**:
   - **Name**: `thehouse-db`
   - **Database**: `thehouse_institute`
   - **User**: `thehouse_user` (auto-gerado)
   - **Region**: `Ohio (US East)` (mais próximo do Brasil)
   - **Plan**: `Free` (100MB, suficiente para teste)

4. **Create Database** ✅

5. **IMPORTANTE**: Copiar a **Internal Database URL** (parecida com):
   ```
   postgresql://thehouse_user:abc123...@dpg-xyz/thehouse_institute
   ```

---

### **ETAPA 3: Deploy do Backend (FastAPI)**

1. **New +** → **Web Service**

2. **Conectar Repositório**:
   - Connect GitHub → Autorizar Render
   - Selecionar: `thehouse_project`

3. **Configurações**:
   - **Name**: `thehouse-backend`
   - **Region**: `Ohio (US East)`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt && alembic upgrade head && python seed_test_data.py
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: `Free`

4. **Environment Variables** (clique em "Advanced"):
   ```
   DATABASE_URL = postgresql://thehouse_user:abc123...@dpg-xyz/thehouse_institute
   SECRET_KEY = gere-uma-chave-secreta-aleatoria-min-32-caracteres-abc123xyz
   PROJECT_NAME = The House Platform
   DEBUG = False
   BACKEND_CORS_ORIGINS = ["https://thehouse-frontend.onrender.com"]
   ```

   **💡 Gerar SECRET_KEY**: Use Python
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Create Web Service** ✅

6. **Aguardar Deploy** (~5-10 minutos primeira vez)

7. **Testar Backend**: Acessar `https://thehouse-backend.onrender.com/docs`
   - Deve abrir o Swagger UI
   - **✨ Dados de teste já inseridos automaticamente!**

---

### **ETAPA 4: Deploy do Frontend (Next.js)**

1. **New +** → **Web Service**

2. **Conectar Repositório**:
   - Selecionar: `thehouse_project` (mesmo repo)

3. **Configurações**:
   - **Name**: `thehouse-frontend`
   - **Region**: `Ohio (US East)`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install -g pnpm && pnpm install && pnpm build
     ```
   - **Start Command**: 
     ```bash
     pnpm start
     ```
   - **Plan**: `Free`

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://thehouse-backend.onrender.com
   NODE_ENV = production
   ```

5. **Create Web Service** ✅

6. **Aguardar Deploy** (~3-5 minutos)

7. **Testar Frontend**: Acessar `https://thehouse-frontend.onrender.com`

---

### **ETAPA 5: Ajustar CORS do Backend**

1. **Backend Dashboard** → **Environment**

2. **Editar** `BACKEND_CORS_ORIGINS`:
   ```json
   ["https://thehouse-frontend.onrender.com"]
   ```

3. **Save Changes** → Backend reiniciará automaticamente

---

### **ETAPA 6: Atualizar .env.local do Frontend (desenvolvimento local)**

```env
NEXT_PUBLIC_API_URL=https://thehouse-backend.onrender.com
```

---

## 🎉 Deploy Concluído!

### **URLs do Sistema:**
- **Frontend**: `https://thehouse-frontend.onrender.com`
- **Backend API**: `https://thehouse-backend.onrender.com`
- **API Docs**: `https://thehouse-backend.onrender.com/docs`
- **Database**: Internal (acessível apenas pelos serviços Render)

### **Credenciais de Teste** (se executou seed_test_data.py):
```
Diretor:      maria.silva@thehouse.com.br      | senha123
Coordenador:  carlos.oliveira@thehouse.com.br  | senha123
Secretário:   ana.costa@thehouse.com.br        | senha123
Professor:    tiago.rodrigues@thehouse.com.br  | senha123
```

---

## ⚡ Comandos Úteis

### **Logs do Backend**
```bash
# No Dashboard do Render → Logs (aba superior)
```

### **Executar Migrações Manualmente**
```bash
# Backend Shell
alembic upgrade head
```

### **Popular Banco com Dados de Teste**
```bash
# Backend Shell
python seed_test_data.py
```

### **Redeploy Manual**
```bash
# No Dashboard → Manual Deploy → Clear build cache & deploy
```

---

## ⚠️ Limitações do Plano Free

- **Sleep após 15 min inatividade** (primeira requisição pode demorar ~30s)
- **750 horas/mês** de uptime (suficiente para 1 serviço 24/7)
- **Database 100MB** (apaga após 90 dias de inatividade)
- **Builds limitadas** (500h/mês)

**💡 Dica**: Para produção, considere upgrade para plano pago ($7/mês por serviço)

---

## 🐛 Troubleshooting

### **Erro: "Module not found"**
- Verificar `requirements.txt` / `package.json` estão completos
- Redeploy com "Clear build cache"

### **Erro: "pydantic-core compilation failed"**
- Atualizado: requirements.txt usa versões com wheels pré-compilados
- Python 3.13 totalmente compatível

### **Erro 502 Bad Gateway**
- Backend ainda iniciando (aguardar 1-2 minutos)
- Verificar logs do backend

### **Erro de CORS**
- Verificar `BACKEND_CORS_ORIGINS` inclui URL exata do frontend
- Backend precisa reiniciar após mudança

### **Database Connection Failed**
- Verificar `DATABASE_URL` está correta
- Database pode estar em sleep (plano free)

### **Frontend não conecta ao Backend**
- Verificar `NEXT_PUBLIC_API_URL` no frontend
- Verificar backend está online (acessar `/docs`)

---

## 🔄 Atualizações Futuras

Para atualizar o sistema:

```bash
# Local
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

**Render detecta automaticamente** e faz redeploy dos serviços! 🎯

---

## 📞 Suporte

- **Render Docs**: https://docs.render.com
- **Community**: https://community.render.com

---

**✨ Sistema no ar e funcionando!** 🚀
