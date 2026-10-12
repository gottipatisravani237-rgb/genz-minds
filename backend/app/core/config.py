import os
import secrets
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDINOVA-AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medinova.db")
    
    # Storage
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    
    # AI & Vector Embedding
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "demo")  # "demo", "gemini", "openai"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    EMBEDDING_DIM: int = int(os.getenv("EMBEDDING_DIM", "384"))
    
    # OCR Provider
    OCR_PROVIDER: str = os.getenv("OCR_PROVIDER", "demo")  # "demo", "tesseract"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
