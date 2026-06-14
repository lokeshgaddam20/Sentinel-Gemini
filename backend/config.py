from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Google Cloud Settings
    PROJECT_ID: str
    LOCATION: str = "us-central1"
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = "dev-client-id"  # default for dev mode
    
    # DLP Settings
    DLP_ENABLED: bool = True
    
    # RBAC Settings
    ALLOWED_USERS: str = ""  # Comma-separated emails
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Logging Settings
    CLOUD_LOGGING_ENABLED: bool = True
    CLOUD_LOG_NAME: str = "sentinel-gemini-api"
    
    # CORS Settings
    ALLOWED_ORIGINS: str = "http://localhost:5173,vscode-webview://*"
    
    # Vertex AI Settings — gemini-2.5-flash is the current stable model
    MODEL_NAME: str = "gemini-2.5-flash"
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.7
    
    # Dev Settings
    DEV_MODE: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def get_allowed_users_list(self) -> List[str]:
        if not self.ALLOWED_USERS:
            return []
        return [email.strip().lower() for email in self.ALLOWED_USERS.split(",")]
    
    def get_allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()
