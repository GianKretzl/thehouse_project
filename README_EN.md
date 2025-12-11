# The House Institute - Educational Platform

Complete educational management system for The House Institute, developed with Next.js (frontend) and FastAPI (backend).

## 🎨 Features

- **JWT Authentication** with roles (Admin/Professor)
- **Complete Admin Dashboard**
- **Professor Management** and class assignments
- **Student Management** and enrollments
- **Class Management** with schedules
- **Lesson Attendance** tracking
- **Grade Management** and assessments
- **Lesson Content** tracking

## 🚀 Technologies

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (The House custom colors)
- **NextAuth.js** (authentication)
- **TanStack Query** (caching and state)
- **Axios** (HTTP requests)

### Backend
- **FastAPI** (Python framework)
- **SQLAlchemy** (ORM)
- **PostgreSQL** (database)
- **Pydantic** (validation)
- **JWT** (authentication)
- **Alembic** (migrations)

## 📦 Installation

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/GianKretzl/thehouse_project.git
cd thehouse_project

# Start containers
docker compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/v1/docs
```

### Option 2: Manual Installation

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/thehouse_institute
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DEBUG=True

# Run migrations
alembic upgrade head

# Seed test users
python seed_users.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure .env.local
cp .env.local.example .env.local

# Start development server
npm run dev
```

## 🗄️ Database Structure

### Main Tables (English)

- **users** - System users (Admin/Professor)
- **professors** - Professor data
- **students** - Student data
- **classes** - Classes and their information
- **schedules** - Class schedules
- **enrollments** - Student enrollments in classes
- **lessons** - Lesson records
- **attendances** - Student attendance
- **assessments** - Grades and assessments

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) with two access levels:

### Admin
- Manage professors
- Manage students
- Create and assign classes
- Set schedules
- View all data

### Professor
- View their classes
- Take attendance
- Record lesson content
- Grade students

## 👥 Test Users

After running `seed_users.py`:

```
Admin:
  Email: admin@teste.com
  Password: admin123

Professor:
  Email: tiago@teste.com
  Password: tiago123
```

⚠️ **IMPORTANT**: Change passwords after first login!

## 📝 API Usage

### Login

```bash
POST http://localhost:8000/api/v1/auth/login
{
  "email": "admin@teste.com",
  "password": "admin123"
}
```

### Create Student

```bash
POST http://localhost:8000/api/v1/students
{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678901",
  "birth_date": "2005-01-15",
  "phone": "(41) 98888-8888"
}
```

## 🎨 Color Palette

Colors extracted from The House Institute official website:

- **Primary (Blue)**: `#6366f1` - Main brand color
- **Secondary (Purple)**: `#a855f7` - Secondary color
- **Accent (Green)**: `#10b981` - Highlights and positive actions

## 📚 API Documentation

After starting the backend:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## 🔧 Useful Scripts

### Backend
```bash
# Run tests
pytest

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Seed test users
python seed_users.py
```

### Frontend
```bash
# Production build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## 📁 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Professors
- `GET /api/v1/professors` - List professors
- `GET /api/v1/professors/{id}` - Get professor details
- `POST /api/v1/professors` - Create professor
- `PUT /api/v1/professors/{id}` - Update professor
- `DELETE /api/v1/professors/{id}` - Deactivate professor

### Students
- `GET /api/v1/students` - List students
- `GET /api/v1/students/{id}` - Get student details
- `POST /api/v1/students` - Create student
- `PUT /api/v1/students/{id}` - Update student
- `DELETE /api/v1/students/{id}` - Deactivate student

### Classes
- `GET /api/v1/classes` - List classes
- `GET /api/v1/classes/{id}` - Get class details
- `POST /api/v1/classes` - Create class
- `PUT /api/v1/classes/{id}` - Update class
- `DELETE /api/v1/classes/{id}` - Deactivate class

### Lessons
- `GET /api/v1/lessons` - List lessons
- `POST /api/v1/lessons` - Create lesson
- `PUT /api/v1/lessons/{id}` - Update lesson
- `DELETE /api/v1/lessons/{id}` - Delete lesson
- `POST /api/v1/lessons/{id}/attendances` - Record attendance
- `GET /api/v1/lessons/{id}/attendances` - List attendances

### Assessments
- `GET /api/v1/assessments` - List assessments
- `POST /api/v1/assessments` - Create assessment
- `PUT /api/v1/assessments/{id}` - Update assessment
- `DELETE /api/v1/assessments/{id}` - Delete assessment

### Admin Dashboard
- `GET /api/v1/admin/dashboard/stats` - Get dashboard statistics

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary of The House Institute.

## 📞 Contact

**The House Institute**
- Address: R. Tereza Nester, 275 - Afonso Pena, São José dos Pinhais - PR
- ZIP: 83045-290
- Phone: (41) 3383-3179
- WhatsApp: (41) 99222-0134
- Website: [thehouseinstitute.com.br](https://www.thehouseinstitute.com.br/)

---

Developed with ❤️ for The House Institute
