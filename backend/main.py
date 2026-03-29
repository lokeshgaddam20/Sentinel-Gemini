from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat
from models.schemas import HealthResponse
from config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Sentinel Gemini API",
    description="Secure AI assistant powered by Vertex AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"vscode-webview://.*|http://localhost:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, tags=["chat"])

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(status="healthy", version="1.0.0")

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(status="healthy", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("=" * 50)
    logger.info("Sentinel Gemini API Starting")
    logger.info(f"Project ID: {settings.PROJECT_ID}")
    logger.info(f"Location: {settings.LOCATION}")
    logger.info(f"Model: {settings.MODEL_NAME}")
    logger.info(f"DLP Enabled: {settings.DLP_ENABLED}")
    logger.info(f"Allowed Users: {len(settings.get_allowed_users_list())} configured")
    logger.info("=" * 50)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )