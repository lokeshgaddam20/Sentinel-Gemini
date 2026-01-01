from config import settings
import logging

logger = logging.getLogger(__name__)

class RBACService:
    """Service for role-based access control"""
    
    def __init__(self):
        self.allowed_users = settings.get_allowed_users_list()
        logger.info(f"RBAC initialized with {len(self.allowed_users)} allowed users")
        
    def check_access(self, email: str) -> bool:
        """
        Check if user has access to the Corporate Copilot
        
        Args:
            email: User email address
            
        Returns:
            True if user is allowed, False otherwise
        """
        # If no users are configured, allow all (for testing)
        if not self.allowed_users:
            logger.warning("No allowed users configured - allowing all access")
            return True
        
        email_lower = email.lower()
        has_access = email_lower in self.allowed_users
        
        if has_access:
            logger.info(f"Access granted to user: {email}")
        else:
            logger.warning(f"Access denied to user: {email}")
        
        return has_access
    
    def add_user(self, email: str) -> None:
        """Add a user to the allowed list (runtime only)"""
        email_lower = email.lower()
        if email_lower not in self.allowed_users:
            self.allowed_users.append(email_lower)
            logger.info(f"Added user to allowed list: {email}")
    
    def remove_user(self, email: str) -> None:
        """Remove a user from the allowed list (runtime only)"""
        email_lower = email.lower()
        if email_lower in self.allowed_users:
            self.allowed_users.remove(email_lower)
            logger.info(f"Removed user from allowed list: {email}")

# Singleton instance
rbac_service = RBACService()