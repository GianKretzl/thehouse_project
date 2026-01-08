# The House Institute - Plataforma Educacional

Sistema completo de gerenciamento educacional para The House Institute, desenvolvido com Next.js (frontend) e FastAPI (backend).

## 🎨 Características

- **Autenticação JWT** com roles (Admin/Professor)
- **Dashboard Administrativo** completo
- **Gestão de Professores** e atribuição de turmas
- **Gestão de Alunos** e matrículas
- **Gestão de Turmas** com horários
- **Registro de Chamadas** por aula
- **Lançamento de Notas** e avaliações
- **Controle de Conteúdo** ministrado por aula

## 🚀 Tecnologias

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (cores personalizadas The House)
- **NextAuth.js** (autenticação)
- **TanStack Query** (cache e estado)
- **Axios** (requisições HTTP)

### Backend
- **FastAPI** (framework Python)
- **SQLAlchemy** (ORM)
- **PostgreSQL** (banco de dados)
- **Pydantic** (validação)
- **JWT** (autenticação)
- **Alembic** (migrações)

## 📦 Instalação

### Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/GianKretzl/thehouse_project.git
cd thehouse_project

# Inicie os containers
docker-compose up -d

# Acesse:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs API: http://localhost:8000/api/v1/docs
```

### Opção 2: Instalação Manual

#### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# Subir o PostgreSQL via Docker (recomendado)
cd ..
docker-compose up -d postgres
cd backend

# Aplicar migrações do banco de dados
alembic upgrade head

# Iniciar servidor de desenvolvimento
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install
# ou
pnpm install

# Configurar .env.local
cp .env.local.example .env.local
# Edite o .env.local se necessário

# Iniciar desenvolvimento
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema (Admin/Professor)
- **professores** - Dados dos professores
- **alunos** - Dados dos alunos
- **turmas** - Turmas e suas informações
- **horarios** - Horários das turmas
- **matriculas** - Matrículas de alunos em turmas
- **aulas** - Registro de aulas ministradas
- **chamadas** - Presença dos alunos
- **avaliacoes** - Notas e avaliações

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) com múltiplos níveis de acesso:

### Director (Diretor)
- Gerenciar professores, pedagogos e secretários
- Gerenciar alunos
- Criar e atribuir turmas
- Definir horários
- Visualizar todos os dados do sistema

### Pedagogue (Pedagogo)
- Visualizar turmas e professores
- Acompanhar desempenho dos alunos
- Gerenciar conteúdo pedagógico

### Secretary (Secretário)
- Gerenciar matrículas
- Visualizar informações de alunos
- Emitir documentos

### Teacher (Professor)
- Visualizar suas turmas
- Fazer chamadas
- Lançar conteúdo das aulas
- Lançar notas dos alunos

### Admin (Administrador do Sistema)
- Acesso total ao sistema
- Gerenciar todas as funcionalidades

## 📝 Uso

### Primeiro Setup

Após iniciar o backend e aplicar as migrações, você pode criar o primeiro usuário via API ou script Python.

### Criar primeiro usuário Admin

```bash
# Via API (POST)
POST http://localhost:8000/api/v1/auth/register
{
  "name": "Administrador",
  "email": "admin@thehouse.com.br",
  "password": "senha123",
  "role": "ADMIN"
}
```

### Login

```bash
POST http://localhost:8000/api/v1/auth/login
{
  "email": "admin@thehouse.com.br",
  "password": "senha123"
}
```

## 🎨 Paleta de Cores

As cores foram extraídas do site oficial da The House Institute:

- **Primary (Azul)**: `#6366f1` - Cor principal da marca
- **Secondary (Roxo)**: `#a855f7` - Cor secundária
- **Accent (Verde)**: `#10b981` - Destaques e ações positivas

## 📚 Documentação da API

Após iniciar o backend, acesse:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## 🔧 Scripts Úteis

### Backend
```bash
# Rodar testes
pytest

# Criar nova migração
alembic revision --autogenerate -m "descrição"

# Aplicar migrações
alembic upgrade head

# Reverter migração
alembic downgrade -1
```

### Frontend
```bash
# Build de produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 📁 Estrutura do Projeto

```
thehouse_project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── admin.py
│   │   │       ├── professores.py
│   │   │       ├── alunos.py
│   │   │       ├── turmas.py
│   │   │       ├── aulas.py
│   │   │       └── avaliacoes.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   └── __init__.py
│   │   └── main.py
│   ├── .env
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── professor/
│   │   │   ├── login/
│   │   │   └── api/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── .env.local
│   ├── Dockerfile
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── package.json
└── docker-compose.yml
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da The House Institute.

## 📞 Contato

**The House Institute**
- Endereço: R. Tereza Nester, 275 - Afonso Pena, São José dos Pinhais - PR
- CEP: 83045-290
- Telefone: (41) 3383-3179
- WhatsApp: (41) 99222-0134
- Site: [thehouseinstitute.com.br](https://www.thehouseinstitute.com.br/)

---

Desenvolvido com ❤️ para The House Institute
