import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    cors_origins: list[str]
    max_audio_bytes: int
    whisper_model: str
    whisper_device: str
    whisper_compute_type: str
    allowed_audio_types: frozenset[str]
    allowed_audio_extensions: frozenset[str]


def _csv(value: str, fallback: str) -> list[str]:
    return [item.strip() for item in (value or fallback).split(",") if item.strip()]


settings = Settings(
    cors_origins=_csv(os.getenv("ASTROCARE_CORS_ORIGINS", ""), "http://localhost:5173"),
    max_audio_bytes=int(os.getenv("ASTROCARE_MAX_AUDIO_BYTES", str(10 * 1024 * 1024))),
    whisper_model=os.getenv("ASTROCARE_WHISPER_MODEL", "base.en"),
    whisper_device=os.getenv("ASTROCARE_WHISPER_DEVICE", "cpu"),
    whisper_compute_type=os.getenv("ASTROCARE_WHISPER_COMPUTE_TYPE", "int8"),
    allowed_audio_types=frozenset(
        {
            "audio/webm",
            "audio/ogg",
            "audio/wav",
            "audio/x-wav",
            "audio/mpeg",
            "audio/mp4",
        }
    ),
    allowed_audio_extensions=frozenset({"webm", "ogg", "wav", "mp3", "mp4", "m4a"}),
)
