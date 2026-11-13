import asyncio
import os
import tempfile
from functools import lru_cache

from app.core.config import settings


@lru_cache(maxsize=1)
def _model():
    from faster_whisper import WhisperModel

    return WhisperModel(
        settings.whisper_model,
        device=settings.whisper_device,
        compute_type=settings.whisper_compute_type,
    )


def _transcribe(path: str) -> str:
    segments, _ = _model().transcribe(path, language="en", task="transcribe")
    return " ".join(segment.text.strip() for segment in segments if segment.text.strip()).strip()


async def transcribe_audio(content: bytes, extension: str) -> str:
    suffix = f".{extension}" if extension else ".webm"
    fd, path = tempfile.mkstemp(prefix="astrocare-", suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as file:
            file.write(content)
        return await asyncio.to_thread(_transcribe, path)
    finally:
        try:
            os.remove(path)
        except FileNotFoundError:
            pass
