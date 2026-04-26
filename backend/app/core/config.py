"""
Core application settings — environment-driven configuration
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # ── App ──────────────────────────────────
    APP_NAME: str = "Soil Intelligence"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production-use-32-char-random"

    # ── Database ─────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://soil_user:soil_pass@localhost:5432/soil_intelligence"

    # ── Auth ─────────────────────────────────
    JWT_SECRET_KEY: str = "jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── CORS ─────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://soilintelligence.lt",
        "https://app.soilintelligence.lt",
    ]

    # ── Email ─────────────────────────────────
    SMTP_HOST: str = "smtp.sendgrid.net"
    SMTP_PORT: int = 587
    SMTP_USER: str = "apikey"
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "noreply@soilintelligence.lt"
    FROM_NAME: str = "Soil Intelligence"

    # ── Storage ───────────────────────────────
    S3_BUCKET: str = "soil-intelligence-reports"
    S3_REGION: str = "eu-north-1"
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""

    # ── Payments ──────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""

    # ── AI / ML ───────────────────────────────
    OPENAI_API_KEY: str = ""          # For GPT-4 consultation engine
    ML_MODEL_PATH: str = "./app/ml/models/"

    # ── External APIs ─────────────────────────
    WORKIS_API_URL: str = "https://api.workis.lt/v2"
    WORKIS_API_KEY: str = ""
    DATACAKE_API_KEY: str = ""
    WEATHER_API_KEY: str = ""        # OpenWeatherMap
    GOOGLE_MAPS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
