from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.voice import router as voice_router
from app.core.config import settings

app = FastAPI(title="AstroCare Voice Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
