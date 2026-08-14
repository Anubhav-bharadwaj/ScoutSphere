from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings

app = FastAPI(
    title="ScoutSphere API",
    description="Autonomous multi-agent opportunity discovery & application engine.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/", tags=["system"])
async def root() -> dict:
    return {"service": "ScoutSphere API", "status": "running"}

# --- Routers are mounted here starting Batch 2 ---
from backend.api.routers import auth, profiles

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(profiles.router, prefix="/users", tags=["users"])