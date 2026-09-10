"""
Core Settings & Configuration for BIS Sahayak
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    PROJECT_NAME: str = "BIS Sahayak"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("ENVIRONMENT", "development") == "development"

    # Database (Optional PostgreSQL; falls back gracefully to in-memory store)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")

    # Allowed CORS Origins
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "https://vamsi2007185.github.io,http://localhost:5173,http://localhost:3000,http://localhost:8000"
    )

    # Lightweight Mode (True by default on Render/cloud to fit within 512 MiB RAM)
    BIS_LIGHTWEIGHT_MODE: bool = os.getenv(
        "BIS_LIGHTWEIGHT_MODE",
        "true" if os.getenv("RENDER") or os.getenv("ENVIRONMENT") == "production" else "false"
    ).lower() in ("true", "1", "yes", "on")

    # FAISS & Embeddings
    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/faiss_index")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    RAW_STANDARDS_DIR: str = os.getenv("RAW_STANDARDS_DIR", "data/raw_standards")

    # Open-Source LLM
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    LLM_API_BASE: str = os.getenv(
        "LLM_API_BASE",
        "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else "http://localhost:11434/v1"
    )
    LLM_API_KEY: str = os.getenv(
        "LLM_API_KEY",
        os.getenv("GROQ_API_KEY", os.getenv("OPENAI_API_KEY", "ollama"))
    )
    LLM_MODEL_NAME: str = os.getenv(
        "LLM_MODEL_NAME",
        "llama-3.1-8b-instant" if os.getenv("GROQ_API_KEY") else "llama3"
    )

    # Digital India Bhashini (IndicTrans2)
    BHASHINI_USER_ID: Optional[str] = os.getenv("BHASHINI_USER_ID")
    BHASHINI_API_KEY: Optional[str] = os.getenv("BHASHINI_API_KEY")
    BHASHINI_PIPELINE_ID: Optional[str] = os.getenv("BHASHINI_PIPELINE_ID")
    BHASHINI_INFERENCE_URL: str = os.getenv(
        "BHASHINI_INFERENCE_URL",
        "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
    )

    # WhatsApp Cloud API
    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "bis_sahayak_webhook_token_2026")
    WHATSAPP_API_TOKEN: Optional[str] = os.getenv("WHATSAPP_API_TOKEN")
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

    @property
    def normalized_database_url(self) -> Optional[str]:
        if not self.DATABASE_URL:
            return None
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
