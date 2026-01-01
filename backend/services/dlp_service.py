from google.cloud import dlp_v2
from config import settings
import logging

logger = logging.getLogger(__name__)

class DLPService:
    """Service for scanning content for sensitive information using Google DLP"""
    
    def __init__(self):
        self.project_id = settings.PROJECT_ID
        self.dlp_enabled = settings.DLP_ENABLED
        
        if self.dlp_enabled:
            self.dlp_client = dlp_v2.DlpServiceClient()
        else:
            logger.warning("DLP scanning is disabled")
            
        self.info_types = [
            # --- 1. DevOps & Engineering (Secrets & Keys) ---
            # Critical for preventing hardcoded secrets in code/chats
            {"name": "GCP_CREDENTIALS"},       # Google Service Account keys
            {"name": "GCP_API_KEY"},           # Google API Keys
            {"name": "AWS_CREDENTIALS"},       # AWS Access Key IDs
            {"name": "AZURE_AUTH_TOKEN"},      # Azure Active Directory tokens
            {"name": "AUTH_TOKEN"},            # Generic OAuth/Bearer tokens
            {"name": "BASIC_AUTH_HEADER"},     # HTTP Basic Auth headers
            {"name": "ENCRYPTION_KEY"},        # Detects PGP, SSH, and other keys
            {"name": "JSON_WEB_TOKEN"},        # JWTs (often contain user info)

            # --- 2. Marketing & Product (User Tracking) ---
            # Critical for GDPR/CCPA compliance in analytics data
            {"name": "ADVERTISING_ID"},        # Google Advertising ID (AAID), IDFA
            {"name": "IMEI_HARDWARE_ID"},      # Mobile device hardware identifiers
            {"name": "MAC_ADDRESS"},           # Network hardware address
            {"name": "IP_ADDRESS"},            # IPv4/IPv6 addresses
            {"name": "HTTP_COOKIE"},           # Sensitive session cookies

            # --- 3. Finance & Sales (Payment Info) ---
            # Critical for PCI-DSS compliance
            {"name": "CREDIT_CARD_NUMBER"},    # Primary Account Number (PAN)
            {"name": "CREDIT_CARD_TRACK_NUMBER"}, # Magnetic stripe data
            {"name": "IBAN_CODE"},             # International Bank Account Numbers
            {"name": "SWIFT_CODE"},            # Bank identification codes
            {"name": "FINANCIAL_ACCOUNT_NUMBER"}, # Generic bank account numbers

            # --- 4. HR & General (PII - Personally Identifiable Info) ---
            # Critical for general privacy
            {"name": "EMAIL_ADDRESS"},
            {"name": "PHONE_NUMBER"},
            {"name": "US_SOCIAL_SECURITY_NUMBER"}, # SSN
            {"name": "PASSPORT"},              # Detects passports from multiple countries
        ]
    
    def scan_text(self, text: str) -> tuple[bool, list]:
        """
        Scan text for sensitive information
        
        Args:
            text: Text to scan
            
        Returns:
            Tuple of (has_sensitive_data, list_of_findings)
        """
        if not self.dlp_enabled:
            return False, []
        
        try:
            parent = f"projects/{self.project_id}"
            
            # Construct the item to inspect
            item = {"value": text}
            
            # Configure the inspection
            inspect_config = {
                "info_types": self.info_types,
                "min_likelihood": dlp_v2.Likelihood.POSSIBLE,
                "include_quote": True,
            }
            
            # Call the API
            response = self.dlp_client.inspect_content(
                request={
                    "parent": parent,
                    "inspect_config": inspect_config,
                    "item": item,
                }
            )
            
            findings = []
            if response.result.findings:
                for finding in response.result.findings:
                    findings.append({
                        "type": finding.info_type.name,
                        "likelihood": dlp_v2.Likelihood(finding.likelihood).name,
                        "quote": finding.quote if finding.quote else "N/A"
                    })
                
                logger.warning(f"DLP found {len(findings)} sensitive data items")
                return True, findings
            
            logger.info("DLP scan passed - no sensitive data found")
            return False, []
            
        except Exception as e:
            logger.error(f"DLP scan error: {str(e)}")
            # On error, allow the request but log it
            return False, []
    
    def get_block_message(self, findings: list) -> str:
        """Generate user-friendly block message"""
        if not findings:
            return "Your prompt contains sensitive information and was blocked."
        
        types = set(f["type"] for f in findings)
        types_str = ", ".join(types)
        
        return f"Your prompt was blocked because it contains sensitive information: {types_str}. Please remove this data and try again."

# Singleton instance
dlp_service = DLPService()