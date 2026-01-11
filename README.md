# The House Institute - Plataforma Educacional

Sistema completo de gerenciamento educacional para The House Institute, desenvolvido com Next.js (frontend) e FastAPI (backend).

## 🎨 Características

- **Autenticação JWT** com múltiplas roles (Admin/Director/Coordinator/Secretary/Teacher)
- **Dashboard em Tempo Real** com estatísticas e gráficos
- **Gestão Completa de Usuários** (professores, coordenadores, secretários)
- **Gestão de Alunos** com matrícula e histórico
- **Gestão de Turmas** com horários e cronogramas
- **Sistema de Frequência** (registro, edição, consulta por aluno/aula)
- **Sistema de Avaliações** com notas, validação e visualização por aluno
- **Controle de Conteúdo** ministrado por aula
- **Calendário Integrado** com eventos, aulas programadas e reservas
- **Sistema de Planejamento** pedagógico com 8 unidades por livro
- **Relatórios e Estatísticas** de desempenho e frequência
- **Alertas de Baixo Desempenho** (frequência e notas)

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

- **users** - Usuários do sistema (Admin/Director/Coordinator/Secretary/Teacher)
- **teachers** - Dados dos professores
- **students** - Dados dos alunos
- **classes** - Turmas e suas informações
- **schedules** - Horários das turmas (dia da semana e horário)
- **enrollments** - Matrículas de alunos em turmas
- **lessons** - Registro de aulas ministradas
- **attendances** - Presença dos alunos (present/absent/late)
- **assessments** - Notas e avaliações (com nota máxima e peso)
- **events** - Eventos institucionais no calendário
- **announcements** - Avisos e comunicados
- **material_reservations** - Reservas de materiais/salas

### Tabelas de Planejamento (em desenvolvimento)

- **books** - Livros didáticos (com 8 unidades)
- **unit_contents** - Conteúdo de cada unidade do livro
- **class_book_assignments** - Associação turma-livro
- **lesson_plans** - Planejamento pedagógico detalhado por aula

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) com múltiplos níveis de acesso:

### Admin (Administrador do Sistema)
- Acesso total ao sistema
- Gerenciar todas as funcionalidades
- Configurações do sistema

### Director (Diretor)
- **Acesso total ao sistema** (mesmo nível que Admin)
- **Dashboard Administrativo em Tempo Real**:
  - Total de alunos ativos vs cadastrados
  - Total de professores (equipe docente)
  - Turmas ativas vs total de turmas
  - Status do sistema (uptime)
  - Visão geral de todas as estatísticas institucionais
- **Pode dar aulas** (ter turmas vinculadas)
- Quando tem turmas: acesso ao dashboard de professor (tempo real)
- Registro de frequência e conteúdo
- Lançamento de avaliações e notas
- Gestão completa de usuários (professores, coordenadores, secretários)
- Gerenciar alunos e matrículas
- Criar e atribuir turmas
- Definir horários e cronogramas
- Visualizar todos os dados do sistema
- Acesso a relatórios gerenciais
- Visualizar frequência e notas de todas as turmas

### Coordinator (Coordenador)
- **Dashboard Pedagógico em Tempo Real**:
  - Total de alunos ativos (acompanhamento)
  - Turmas em andamento (registro de frequência e conteúdo)
  - Total de professores (equipe)
  - Alertas de baixo desempenho
- **Pode dar aulas** (ter turmas vinculadas)
- Quando tem turmas: acesso ao dashboard de professor (tempo real)
- Registro de frequência e conteúdo das suas turmas
- Lançamento de avaliações e notas das suas turmas
- Visualizar todas as turmas e professores
- Acompanhar desempenho de todos os alunos
- Gerenciar conteúdo pedagógico de todas as turmas
- Visualizar frequência e notas de todas as turmas (somente leitura)
- Gerar relatórios pedagógicos
- Alertas de baixo desempenho (frequência < 75% ou notas < 7.0)

### Secretary (Secretário)
- **Dashboard Administrativo em Tempo Real**:
  - Total de alunos matriculados
  - Total de matrículas ativas
  - Total de turmas disponíveis
  - Status de ocupação das turmas
- Gerenciar matrículas (criar, editar, inativar)
- Gerenciar cadastro completo de alunos
- Visualizar informações de todas as turmas
- Consultar frequência e notas de todos os alunos (somente leitura)
- Emitir relatórios e documentos
- Gerenciar reservas de materiais
- Acesso ao calendário institucional

### Teacher (Professor)
- **Dashboard em Tempo Real** com estatísticas da turma:
  - Taxa de frequência geral e última aula
  - Média, maior, menor e mediana de notas
  - Aulas completadas vs esperadas
  - Alertas de alunos com baixa frequência (< 75%)
  - Alertas de alunos com notas baixas (< 7.0)
  - Atividades recentes
  - Detalhes por aluno (frequência e desempenho)
- **Sistema de Frequência**:
  - Cadastrar frequência (presente/faltou/atrasado)
  - Editar frequências registradas
  - Adicionar observações da aula
  - Consultar por aluno ou por aula
  - Matriz de frequência aluno × aula
- **Sistema de Conteúdo**:
  - Lançar conteúdo ministrado em cada aula
  - Editar conteúdo de aulas anteriores
  - Visualizar histórico de conteúdos
- **Sistema de Avaliações**:
  - Criar avaliações por tipo (av1, av2, prova, trabalho, etc)
  - Definir nota máxima por avaliação (até 10.0)
  - Lançar notas com validação automática
  - Editar avaliações existentes
  - Excluir avaliações
  - Visualização por avaliação ou por aluno
  - Formatação automática de notas (ex: 14 → 1.4, 2 → 2.0)
  - Validação em tempo real (máximo 1 casa decimal)
  - Coluna de somatória total por aluno
- **Calendário Integrado**:
  - Visualizar eventos institucionais
  - Ver aulas programadas (baseadas nos horários)
  - Ver aulas já registradas (com frequência)
  - Consultar reservas de materiais
- **Planejamento Pedagógico** (em desenvolvimento):
  - Sistema de 8 unidades por livro
  - Objetivos e conteúdo por aula
  - Materiais necessários
  - Método PPP (Presentation, Practice, Production)

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
