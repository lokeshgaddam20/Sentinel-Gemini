from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest, ChatResponse, StreamChunk, ErrorResponse
from services.auth_service import auth_service
from services.rbac_service import rbac_service
from services.dlp_service import dlp_service
from services.vertex_service import vertex_service
import logging
import json
from typing import AsyncIterator

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - handles both streaming and non-streaming requests
    """
    try:
        # Step 1: Authenticate user
        try:
            user_email = auth_service.validate_token(request.token)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )
        
        # Step 2: Check RBAC
        if not rbac_service.check_access(user_email):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User {user_email} is not authorized to use Sentinel Gemini"
            )
        
        # Step 3: DLP Scan
        has_sensitive_data, findings = dlp_service.scan_text(request.prompt)
        if has_sensitive_data:
            logger.warning(f"DLP blocked prompt from user {user_email}")
            return ChatResponse(
                response=dlp_service.get_block_message(findings),
                blocked=True,
                metadata={
                    "user": user_email,
                    "reason": "sensitive_data",
                    "findings": [f["type"] for f in findings]
                }
            )
        
        # Step 4: Generate response
        if request.stream:
            # Return streaming response
            return StreamingResponse(
                stream_generator(request.prompt, user_email),
                media_type="text/event-stream"
            )
        else:
            # Return complete response
            response_text = vertex_service.generate_response(
                request.prompt,
                user_email
            )
            
            return ChatResponse(
                response=response_text,
                blocked=False,
                metadata={
                    "model": vertex_service.model_name,
                    "user": user_email
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred"
        )

async def stream_generator(prompt: str, user_email: str) -> AsyncIterator[str]:
    """Generate Server-Sent Events for streaming responses"""
    try:
        for chunk in vertex_service.generate_response_stream(prompt, user_email):
            # Format as SSE
            stream_chunk = StreamChunk(type="token", content=chunk)
            yield f"data: {stream_chunk.model_dump_json()}\n\n"
        
        # Send done signal
        done_chunk = StreamChunk(type="done")
        yield f"data: {done_chunk.model_dump_json()}\n\n"
        
    except Exception as e:
        logger.error(f"Streaming error: {str(e)}")
        error_chunk = StreamChunk(type="error", error=str(e))
        yield f"data: {error_chunk.model_dump_json()}\n\n"