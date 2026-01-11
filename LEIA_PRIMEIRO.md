# The House Institute Platform - Deploy Rápido 🚀

## 📦 Arquivos Criados para Deploy:

✅ **render.yaml** - Blueprint automático (recomendado)
✅ **backend/build.sh** - Script de build
✅ **DEPLOY_RENDER.md** - Guia completo passo a passo
✅ **requirements.txt** - Adicionado gunicorn

---

## 🎯 3 Opções de Deploy

### **OPÇÃO 1: Blueprint Automático** ⭐ RECOMENDADO

1. Fazer push do código para GitHub
2. Render Dashboard → New → Blueprint
3. Conectar repositório
4. Render cria tudo automaticamente (DB + Backend + Frontend)
5. Ajustar URLs depois da criação

**Tempo**: ~15 minutos

---

### **OPÇÃO 2: Manual (Passo a Passo Completo)**

Seguir o guia em **DEPLOY_RENDER.md** linha por linha.

**Tempo**: ~30 minutos

---

### **OPÇÃO 3: Render CLI**

```bash
# Instalar CLI
npm install -g @render/cli

# Login
render login

# Deploy
render blueprint launch
```

---

## 📝 Checklist Antes do Deploy

```bash
☐ 1. Git inicializado e código comitado
☐ 2. Repositório no GitHub criado
☐ 3. Push para GitHub
☐ 4. Conta Render criada
☐ 5. Editar render.yaml (URLs do repositório)
```

---

## 🚀 Deploy Express (5 passos)

```bash
# 1. Git
git init
git add .
git commit -m "Deploy ready"

# 2. GitHub (criar repo vazio no site)
git remote add origin https://github.com/SEU_USUARIO/thehouse_project.git
git push -u origin main

# 3. Render Dashboard
# - New → Blueprint
# - Conectar GitHub → Selecionar repo
# - Deploy

# 4. Aguardar (~10 min)

# 5. Testar
# Frontend: https://thehouse-frontend.onrender.com
# Backend: https://thehouse-backend.onrender.com/docs
```

---

## ⚠️ IMPORTANTE

1. **SECRET_KEY**: Gerar nova chave:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **URLs**: Atualizar no render.yaml após deploy:
   - BACKEND_CORS_ORIGINS
   - NEXT_PUBLIC_API_URL

3. **Dados de Teste**: Popular banco após deploy:
   ```bash
   # Backend Shell no Render
   python seed_test_data.py
   ```

---

## 📖 Documentação Completa

Veja **DEPLOY_RENDER.md** para:
- Passo a passo detalhado
- Screenshots necessários
- Troubleshooting
- Comandos úteis
- Limitações do plano free

---

**Qualquer dúvida, consulte DEPLOY_RENDER.md! ✨**
