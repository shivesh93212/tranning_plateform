from fastapi import FastAPI
from sqlalchemy import text
from app.routers import admin

from app.db.database import engine

from app.routers import auth
from app.routers import practice
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Aptitude Platform API",
    description="Backend API for Aptitude and DSA preparation platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"],
)
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(
    practice.router,
    prefix="/practice",
    tags=["Practice"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Aptitude Platform API is running",
    }


@app.get("/health/db")
async def database_health_check():
    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
        "result": result.scalar(),
    }