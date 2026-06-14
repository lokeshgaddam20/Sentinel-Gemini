import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import HealthResponse
from config import settings

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


def configure_logging() -> None:
    logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    if not settings.CLOUD_LOGGING_ENABLED:
        return

    cloud_handler_exists = any(
        getattr(handler, "_sentinel_cloud_logging", False)
        for handler in root_logger.handlers
    )
    if cloud_handler_exists:
        return

    try:
        from google.cloud import logging as cloud_logging
        from google.cloud.logging.handlers import CloudLoggingHandler

        client = cloud_logging.Client(project=settings.PROJECT_ID)
        handler = CloudLoggingHandler(client, name=settings.CLOUD_LOG_NAME)
        handler.setLevel(logging.INFO)
        handler._sentinel_cloud_logging = True
        root_logger.addHandler(handler)
        logging.getLogger(__name__).info("Cloud Logging handler attached")
    except Exception as exc:
        logging.getLogger(__name__).warning(
            "Cloud Logging unavailable; continuing with local logging: %s",
            exc,
        )


configure_logging()

from routers import chat

logger = logging.getLogger(__name__)


def log_startup_settings() -> None:
    logger.info("=" * 50)
    logger.info("Sentinel Gemini API Starting")
    logger.info("Project ID: %s", settings.PROJECT_ID)
    logger.info("Location: %s", settings.LOCATION)
    logger.info("Model: %s", settings.MODEL_NAME)
    logger.info("DLP Enabled: %s", settings.DLP_ENABLED)
    logger.info("Allowed Users: %s configured", len(settings.get_allowed_users_list()))
    logger.info("=" * 50)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log_startup_settings()
    yield


# Create FastAPI app
app = FastAPI(
    title="Sentinel Gemini API",
    description="Secure AI assistant powered by Vertex AI",
    version="1.0.0",
    lifespan=lifespan,
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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Emit request audit logs to local logs and Cloud Logging."""
    started_at = time.perf_counter()
    request_logger = logging.getLogger("sentinel_gemini.requests")
    client_host = request.client.host if request.client else None

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        request_logger.exception(
            "HTTP request failed method=%s path=%s status_code=500 duration_ms=%s client_host=%s",
            request.method,
            request.url.path,
            duration_ms,
            client_host,
            extra={
                "json_fields": {
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "client_host": client_host,
                }
            },
        )
        raise

    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    request_logger.info(
        "HTTP request completed method=%s path=%s status_code=%s duration_ms=%s client_host=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        client_host,
        extra={
            "json_fields": {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client_host": client_host,
            }
        },
    )
    return response

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(status="healthy", version="1.0.0")

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(status="healthy", version="1.0.0")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
