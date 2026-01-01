from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """Service for validating Google OAuth tokens"""
    
    def __init__(self):
        self.google_client_id = settings.GOOGLE_CLIENT_ID
        
    def validate_token(self, token: str) -> str:
        """
        Validate Google ID token and return user email
        
        Args:
            token: Google OAuth access token or ID token
            
        Returns:
            User email address
            
        Raises:
            ValueError: If token is invalid
        """
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