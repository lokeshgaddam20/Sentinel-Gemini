import warnings

warnings.filterwarnings(
    "ignore",
    message=r'Field name ".*" shadows an attribute in parent "Operation"',
    category=UserWarning,
    module=r"pydantic\._internal\._fields",
)

from google import genai
from google.genai import types
from config import settings
import logging
from typing import Iterator

logger = logging.getLogger(__name__)

class VertexAIService:
    """Service for interacting with Vertex AI Gemini models"""
    
    def __init__(self):
        self.project_id = settings.PROJECT_ID
        self.location = settings.LOCATION
        self.model_name = settings.MODEL_NAME
        
        self.client = genai.Client(
            vertexai=True,
            project=self.project_id,
            location=self.location,
            http_options=types.HttpOptions(api_version="v1"),
        )
        
        self.generation_config = types.GenerateContentConfig(
            max_output_tokens=settings.MAX_TOKENS,
            temperature=settings.TEMPERATURE,
        )
        
        logger.info(f"Vertex AI initialized with model: {self.model_name}")
    
    def generate_response(self, prompt: str, user_email: str) -> str:
        try:
            full_prompt = self._build_prompt(prompt, user_email)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config=self.generation_config,
            )
            if not response.text:
                raise ValueError("Empty response from model")
            logger.info(f"Generated response for user: {user_email}")
            return response.text
        except Exception as e:
            logger.error(f"Vertex AI error: {str(e)}")
            raise ValueError(f"Failed to generate response: {str(e)}")
    
    def generate_response_stream(self, prompt: str, user_email: str) -> Iterator[str]:
        try:
            full_prompt = self._build_prompt(prompt, user_email)
            responses = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=full_prompt,
                config=self.generation_config,
            )
            for response in responses:
                if response.text:
                    yield response.text
            logger.info(f"Completed streaming response for user: {user_email}")
        except Exception as e:
            logger.error(f"Vertex AI streaming error: {str(e)}")
            raise ValueError(f"Failed to generate streaming response: {str(e)}")
    
    def _build_prompt(self, user_prompt: str, user_email: str) -> str:
        system_context = f"""You are Sentinel Gemini, a helpful AI assistant for enterprise developers.
You are a secure AI system with DLP protection — you never expose secrets or sensitive data.

Current user: {user_email}

Guidelines:
- Be concise, professional and helpful
- Format code with proper language identifiers
- If something is unclear, ask for clarification

User's question:
"""
        return system_context + user_prompt

# Singleton instance
vertex_service = VertexAIService()
