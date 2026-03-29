from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings
import logging
import os

logger = logging.getLogger(__name__)

class AuthService:
    """Service for validating Google OAuth tokens"""
    
    def __init__(self):
        self.google_client_id = settings.GOOGLE_CLIENT_ID
        self.dev_mode = settings.DEV_MODE
        
        if self.dev_mode:
            logger.warning("🔓 DEV_MODE is ON — token validation is bypassed!")
        
    def validate_token(self, token: str) -> str:
        """
        Validate Google ID token and return user email.
        
        In DEV_MODE, accepts "dev-mode" token and returns the first
        configured allowed user email.
        """
        # Dev-mode bypass — skip real token validation for ANY token
        if self.dev_mode:
            allowed = settings.get_allowed_users_list()
            dev_email = allowed[0] if allowed else "dev@localhost"
            logger.info(f"[DEV] Bypassed auth → {dev_email}")
            return dev_email
        
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                self.google_client_id
            )
            
            # Get user email
            email = idinfo.get('email')
            if not email:
                raise ValueError("Email not found in token")
            
            logger.info(f"Successfully authenticated user: {email}")
            return email
            
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise ValueError(f"Invalid authentication token: {str(e)}")

# Singleton instance
auth_service = AuthService()