# The House Project - Quick Start Guide

## 🚀 Início Rápido

### 1. Clone o repositório
```bash
git clone https://github.com/GianKretzl/thehouse_project.git
cd thehouse_project
```

### 2. Usando Docker (Mais Fácil)

```bash
# Inicie todos os serviços
docker-compose up -d

# Aguarde os containers iniciarem (pode levar alguns minutos na primeira vez)
# Acesse: http://localhost:3000
```

### 3. Configuração Manual

#### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente (Windows)
.\venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Copiar .env
# Edite DATABASE_URL e SECRET_KEY
code .env

# Criar banco de dados PostgreSQL
# Certifique-se que PostgreSQL está instalado e rodando
createdb thehouse_db

# Rodar migrações
alembic upgrade head

# Criar usuário admin
python create_admin.py

# Iniciar servidor
uvicorn app.main:app --reload
```

Backend estará em: http://localhost:8000

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar .env.local
code .env.local

# Iniciar desenvolvimento
npm run dev
```

Frontend estará em: http://localhost:3000

## 📋 Credenciais Padrão

Após criar o admin com `python create_admin.py`:

- **Email**: admin@thehouse.com.br
- **Senha**: admin123

⚠️ **Altere a senha após o primeiro login!**

## 🎯 Próximos Passos

1. Faça login no sistema
2. Crie professores em "Professores"
3. Cadastre alunos em "Alunos"
4. Crie turmas e atribua aos professores
5. Defina horários para as turmas

## 🐛 Problemas Comuns

### Backend não inicia
- Verifique se PostgreSQL está rodando
- Confirme as credenciais em `.env`
- Execute as migrações: `alembic upgrade head`

### Frontend não conecta
- Verifique se o backend está rodando
- Confirme a URL em `.env.local`
- Limpe o cache: `npm run dev -- --reset`

### Docker não funciona
- Verifique se Docker está instalado e rodando
- Tente: `docker-compose down -v && docker-compose up --build`

## 📚 Documentação Completa

Veja [README.md](README.md) para documentação completa.
