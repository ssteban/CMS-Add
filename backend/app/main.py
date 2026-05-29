from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth_route
from app.db.database import engine, Base

# Crear tablas en la base de datos si no existen
# Esto es útil para arrancar rápido localmente y conectarse a Neon
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "200 Ok"}

@app.head("/health")
async def health_check():
    return {"message": "200 Ok"}



app.include_router(auth_route.router, prefix="/api/v1/auth", tags=["auth"])






