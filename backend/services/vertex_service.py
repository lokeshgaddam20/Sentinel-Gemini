import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
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
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Create model instance
        self.model = GenerativeModel(self.model_name)
        
        # Generation config
        self.generation_config = GenerationConfig(
            max_output_tokens=settings.MAX_TOKENS,
            temperature=settings.TEMPERATURE,
        )
        
        logger.info(f"Vertex AI initialized with model: {self.model_name}")
    
    def generate_response(self, prompt: str, user_email: str) -> str:
        """
        Generate a response using Gemini
        
        Args:
            prompt: User's prompt
            user_email: User's email for logging
            
        Returns:
            AI-generated response
        """
        try:
            # Add system context to prompt
            full_prompt = self._build_prompt(prompt, user_email)
            
            # Generate response
            response = self.model.generate_content(
                full_prompt,
                generation_config=self.generation_config,
            )
            
            if not response.text:
                raise ValueError("Empty response from model")
            
            logger.info(f"Generated response for user: {user_email}")
            return response.text
            
        except Exception as e:
            logger.error(f"Vertex AI error: {str(e)}")
            raise ValueError(f"Failed to generate response: {str(e)}")
    
    def generate_response_stream(self, prompt: str, user_email: str) -> Iterator[str]:
        """
        Generate a streaming response using Gemini
        
        Args:
            prompt: User's prompt
            user_email: User's email for logging
            
        Yields:
            Chunks of AI-generated text
        """
        try:
            # Add system context to prompt
            full_prompt = self._build_prompt(prompt, user_email)
            
            # Generate streaming response
            responses = self.model.generate_content(
                full_prompt,
                generation_config=self.generation_config,
                stream=True,
            )
            
            for response in responses:
                if response.text:
                    yield response.text
            
            logger.info(f"Completed streaming response for user: {user_email}")
            
        except Exception as e:
            logger.error(f"Vertex AI streaming error: {str(e)}")
            raise ValueError(f"Failed to generate streaming response: {str(e)}")
    
    def _build_prompt(self, user_prompt: str, user_email: str) -> str:
        """Build the full prompt with system context"""
        system_context = f"""You are a helpful AI assistant for enterprise employees at a company. 
You are part of "Sentinel Gemini", a secure AI system.

Current user: {user_email}

Guidelines:
- Be professional and helpful
- Provide accurate, well-structured responses
- When providing code, use proper formatting with language identifiers
- Be concise but thorough
- If you're unsure about something, say so

User's question:
"""
        return system_context + user_prompt

# Singleton instance
vertex_service = VertexAIService()