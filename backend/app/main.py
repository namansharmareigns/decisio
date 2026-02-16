"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import decision_routes, context_routes, evaluation_routes

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Decision Intelligence Platform API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(decision_routes.router, prefix=settings.API_V1_PREFIX)
app.include_router(context_routes.router, prefix=settings.API_V1_PREFIX)
app.include_router(evaluation_routes.router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Decisio API"}


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Decisio API",
        "docs": "/docs",
        "health": "/health"
    }
