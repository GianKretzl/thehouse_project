# 🚀 Deploy no Render - The House Institute Platform

## ✅ Deploy Automático Configurado!

Este projeto está configurado para **deploy automático** a cada commit na branch `main`.

### 🔄 Como Funciona

**A cada `git push` para `main`:**
1. GitHub envia webhook para o Render
2. Render detecta mudanças em `backend/` ou `frontend/`
3. Build automático dos serviços alterados
4. Deploy sem interrupção (zero downtime)
5. Rollback automático em caso de falha

**Tempo de deploy:** ~8-10 minutos (backend + frontend)

---

## 📋 Pré-requisitos

1. **Conta no Render**: [https://render.com](https://render.com)
2. **Repositório GitHub**: Código em `https://github.com/GianKretzl/thehouse_project`
3. **Arquivo `render.yaml`**: ✅ Já configurado

---

## 🚀 Setup Inicial (Apenas Primeira Vez)

### **ETAPA 1: Conectar Repositório ao Render**

1. **Login no Render** → [https://dashboard.render.com](https://dashboard.render.com)

2. **New +** → **Blueprint** (Deploy via render.yaml)

3. **Connect Repository**:
   - Conecte sua conta GitHub
   - Selecione `GianKretzl/thehouse_project`
   - Branch: `main`

4. **Apply Blueprint** ✅

O Render vai criar automaticamente:
- ✅ PostgreSQL Database (`thehouse-db`)
- ✅ Backend FastAPI (`thehouse-backend`)
- ✅ Frontend Next.js (`thehouse-frontend`)

---

## 🎯 Deploy Automático - Workflow

### **Desenvolvimento Local**

```bash
# 1. Crie uma branch para desenvolvimento
git checkout -b feature/nova-funcionalidade

# 2. Faça suas alterações
# ... edite arquivos ...

# 3. Commit local
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para GitHub (não dispara deploy)
git push origin feature/nova-funcionalidade
```

### **Quando Estiver Pronto para Produção**

```bash
# 5. Merge para main
git checkout main
git merge feature/nova-funcionalidade

# 6. Push para main (DISPARA DEPLOY AUTOMÁTICO)
git push origin main
```

**O que acontece automaticamente:**
1. ⏳ GitHub notifica Render sobre o push
2. 🔍 Render identifica arquivos alterados:
   - `backend/*` → Rebuilda apenas backend
   - `frontend/*` → Rebuilda apenas frontend
   - Ambos → Rebuilda ambos serviços
3. 🏗️ Build (3-5 min cada serviço)
4. ✅ Deploy automático
5. 🔄 Health checks
6. 🎉 Serviços atualizados!

---

## 📊 Monitorar Deploys

### **Dashboard do Render**
```
https://dashboard.render.com/
```

**Ver logs em tempo real:**
- Backend: `https://dashboard.render.com/web/thehouse-backend`
- Frontend: `https://dashboard.render.com/web/thehouse-frontend`
- Database: `https://dashboard.render.com/d/thehouse-db`

### **Notificações de Deploy**

O GitHub Actions está configurado para mostrar status:
```
Actions → Deploy to Render → Ver último workflow
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
   - **⚠️ IMPORTANTE**: Clique em **"Advanced"** antes de criar!

4. **Environment Variables** ⚡ **CONFIGURE ANTES DE CRIAR O SERVIÇO**:
   
   Clique em **"Advanced"** e adicione as variáveis:
   
   ```
   DATABASE_URL = postgresql://thehouse_user:SENHA_AQUI@dpg-XXXXX/thehouse_institute
   ```
   ☝️ Cole a **Internal Database URL** copiada na Etapa 2 (linha 48)
   
   ```
   SECRET_KEY = COLE_A_CHAVE_GERADA_AQUI
   ```
   ☝️ Gere executando no seu terminal local:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   
   ```
   PROJECT_NAME = The House Platform
   DEBUG = False
   BACKEND_CORS_ORIGINS = ["https://thehouse-frontend.onrender.com"]
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
     npm install -g pnpm && pnpm install --no-frozen-lockfile && pnpm build
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

### **Erro: "Cannot install with frozen-lockfile" (Frontend)**
- Build command atualizado: usa `pnpm install --no-frozen-lockfile`
- Se já criou o serviço: Settings → Build Command → Adicionar `--no-frozen-lockfile`

### **Erro 502 Bad Gateway**
- Backend ainda iniciando (aguardar 1-2 minutos)
- Verificar logs do backend

### **Erro de CORS**
- Verificar `BACKEND_CORS_ORIGINS` inclui URL exata do frontend
- Backend precisa reiniciar após mudança

### **Database Connection Failed**
- Verificar `DATABASE_URL` está correta (copie da aba "Connect" do database)
- Usar **Internal Database URL**, não External
- Database pode estar em sleep (plano free)

### **Validation Error: DATABASE_URL/SECRET_KEY required**
- ⚠️ **Configure as Environment Variables ANTES de criar o serviço**
- No Render, clique "Advanced" → Adicione todas as variáveis → Então "Create Web Service"
- Se já criou sem as variáveis: Dashboard → Environment → Add Environment Variables → Save

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
