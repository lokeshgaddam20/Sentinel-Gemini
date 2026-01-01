from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Google Cloud Settings
    PROJECT_ID: str
    LOCATION: str = "us-central1"
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str
    
    # DLP Settings
    DLP_ENABLED: bool = True
    
    # RBAC Settings
    ALLOWED_USERS: str = ""  # Comma-separated emails
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # CORS Settings
    ALLOWED_ORIGINS: str = "http://localhost:5173,vscode-webview://*"
    
    # Vertex AI Settings
    MODEL_NAME: str = "gemini-2.0-flash"
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def get_allowed_users_list(self) -> List[str]:
        """Parse comma-separated allowed users into a list"""
        if not self.ALLOWED_USERS:
            return []
        return [email.strip().lower() for email in self.ALLOWED_USERS.split(",")]
    
    def get_allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()