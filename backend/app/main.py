from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, admin, teachers, students, classes, lessons, assessments

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

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
