from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZIPMiddleware
from app.core.config import settings
from app.api.routes import auth, admin, teachers, students, classes, lessons, assessments, enrollments, activities, calendar, lesson_planning

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# Compression - reduz tamanho das respostas em até 70%
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(admin.router, prefix=f"{settings.API_V1_PREFIX}/admin/dashboard", tags=["admin"])
app.include_router(teachers.router, prefix=f"{settings.API_V1_PREFIX}/teachers", tags=["teachers"])
app.include_router(students.router, prefix=f"{settings.API_V1_PREFIX}/students", tags=["students"])
app.include_router(classes.router, prefix=f"{settings.API_V1_PREFIX}/classes", tags=["classes"])
app.include_router(lessons.router, prefix=f"{settings.API_V1_PREFIX}/lessons", tags=["lessons"])
app.include_router(assessments.router, prefix=f"{settings.API_V1_PREFIX}/assessments", tags=["assessments"])
app.include_router(enrollments.router, prefix=f"{settings.API_V1_PREFIX}/enrollments", tags=["enrollments"])
app.include_router(activities.router, prefix=f"{settings.API_V1_PREFIX}/activities", tags=["activities"])
app.include_router(calendar.router, prefix=f"{settings.API_V1_PREFIX}/calendar", tags=["calendar"])
app.include_router(lesson_planning.router, prefix=f"{settings.API_V1_PREFIX}/planning", tags=["planning"])


@app.get("/")
async def root():
    return {
        "message": "The House Institute - API Platform",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
