import os
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, EmailStr, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )
    
    PROJECT_NAME: str = "EliteBuilders"
    ENVIRONMENT: str = "development"
    
    # BACKEND_CORS_ORIGINS is a list of origins that are allowed
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Database
    DATABASE_URL: PostgresDsn
    
    # Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AWS S3 or equivalent for file storage
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET_NAME: str
    S3_REGION: str
    
    # Redis
    REDIS_URL: str
    
    # AI Services
    OPENAI_API_KEY: str
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAIL_FROM: EmailStr
    
    # Application-specific settings
    MAX_SUBMISSION_SIZE_MB: int = 100  # Maximum file size for submissions
    CHALLENGES_PER_PAGE: int = 10      # Pagination default
    SUBMISSIONS_PER_PAGE: int = 10     # Pagination default
    
    # Function to validate the PostgreSQL dsn
    @field_validator("DATABASE_URL")
    def assemble_db_connection(cls, v: Optional[str], info: dict) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            username=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "password"),
            host=os.getenv("POSTGRES_SERVER", "localhost"),
            port=os.getenv("POSTGRES_PORT", "5432"),
            path=f"/{os.getenv('POSTGRES_DB', 'elitebuilders')}",
        )

# Create settings instance
settings = Settings()
