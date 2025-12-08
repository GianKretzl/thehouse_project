from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, admin, professores, alunos, turmas, aulas, avaliacoes

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

# Rotas
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(admin.router, prefix=f"{settings.API_V1_PREFIX}/admin/dashboard", tags=["admin"])
app.include_router(professores.router, prefix=f"{settings.API_V1_PREFIX}/professores", tags=["professores"])
app.include_router(alunos.router, prefix=f"{settings.API_V1_PREFIX}/alunos", tags=["alunos"])
app.include_router(turmas.router, prefix=f"{settings.API_V1_PREFIX}/turmas", tags=["turmas"])
app.include_router(aulas.router, prefix=f"{settings.API_V1_PREFIX}/aulas", tags=["aulas"])
app.include_router(avaliacoes.router, prefix=f"{settings.API_V1_PREFIX}/avaliacoes", tags=["avaliacoes"])


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
