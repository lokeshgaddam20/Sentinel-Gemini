from pydantic import BaseModel, Field
from typing import Optional, Literal

class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)
    token: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    stream: bool = False

class ChatResponse(BaseModel):
    response: str
    blocked: bool = False
    metadata: dict = {}

class StreamChunk(BaseModel):
    type: Literal["token", "done", "error"]
    content: Optional[str] = None
    error: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"