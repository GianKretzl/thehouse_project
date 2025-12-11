# Translation Summary - Backend & Database

## Database Name
- **Old**: `thehouse_db`
- **New**: `thehouse_institute`

## Tables Translated (Portuguese → English)
- `professores` → `professors`
- `alunos` → `students`
- `turmas` → `classes`
- `horarios` → `schedules`
- `matriculas` → `enrollments`
- `aulas` → `lessons`
- `chamadas` → `attendances`
- `avaliacoes` → `assessments`

## Column Translations

### Professors Table
- `telefone` → `phone`
- `especialidade` → `specialty`
- `data_admissao` → `hire_date`

### Students Table
- `nome` → `name`
- `telefone` → `phone`
- `data_nascimento` → `birth_date`
- `endereco` → `address`
- `responsavel_nome` → `guardian_name`
- `responsavel_telefone` → `guardian_phone`

### Classes Table
- `nome` → `name`
- `descricao` → `description`
- `nivel` → `level`
- `capacidade_maxima` → `max_capacity`
- `data_inicio` → `start_date`
- `data_fim` → `end_date`

### Schedules Table
- `turma_id` → `class_id`
- `dia_semana` → `weekday`
- `hora_inicio` → `start_time`
- `hora_fim` → `end_time`
- `sala` → `room`

### Enrollments Table
- `aluno_id` → `student_id`
- `turma_id` → `class_id`
- `data_matricula` → `enrollment_date`

### Lessons Table
- `turma_id` → `class_id`
- `data` → `date`
- `conteudo` → `content`
- `observacoes` → `notes`

### Attendances Table
- `aula_id` → `lesson_id`
- `aluno_id` → `student_id`
- `presente` → `present`
- `observacao` → `note`

### Assessments Table
- `aula_id` → `lesson_id`
- `aluno_id` → `student_id`
- `tipo` → `type`
- `nota` → `grade`
- `peso` → `weight`
- `observacao` → `note`
- `data_avaliacao` → `assessment_date`

## API Routes Updated

### Old Routes → New Routes
- `/api/v1/professores` → `/api/v1/professors`
- `/api/v1/alunos` → `/api/v1/students`
- `/api/v1/turmas` → `/api/v1/classes`
- `/api/v1/aulas` → `/api/v1/lessons`
- `/api/v1/avaliacoes` → `/api/v1/assessments`

## Files Changed

### Backend
- ✅ `app/models/__init__.py` - All models translated
- ✅ `app/schemas/__init__.py` - All schemas translated
- ✅ `app/api/routes/professors.py` - New file (replaces professores.py)
- ✅ `app/api/routes/students.py` - New file (replaces alunos.py)
- ✅ `app/api/routes/classes.py` - New file (replaces turmas.py)
- ✅ `app/api/routes/lessons.py` - New file (replaces aulas.py)
- ✅ `app/api/routes/assessments.py` - New file (replaces avaliacoes.py)
- ✅ `app/api/routes/admin.py` - Updated to use new model names
- ✅ `app/main.py` - Updated imports and routes
- ✅ `.env` - Updated DATABASE_URL
- ✅ `alembic/` - New migration created

### Frontend
- ✅ `src/types/api.ts` - New TypeScript interfaces
- ✅ `.env.local.example` - Created example file

### Documentation
- ✅ `README_EN.md` - English version with updated endpoints
- ✅ `TRANSLATION.md` - This file

## Test Users Created

```
Admin:
  Email: admin@teste.com
  Password: admin123

Professor:
  Email: tiago@teste.com
  Password: tiago123
```

## Migration Applied
✅ Migration `40c69a6afaab_initial_schema_english.py` created and applied

## What Remains in Portuguese
- User-facing messages (error messages, validation messages)
- Comments in code explaining business logic
- Documentation for Brazilian users

## How to Run

### Start Database (Docker)
```bash
docker compose up -d postgres
```

### Run Backend
```bash
cd backend
.\venv\Scripts\activate
python seed_users.py  # First time only
uvicorn app.main:app --reload
```

### Access API Docs
http://localhost:8000/api/v1/docs

## Breaking Changes
⚠️ **All API endpoints have changed**. Frontend code needs to be updated to use new endpoint names.
⚠️ **Database has been recreated**. Old data will not be available.
