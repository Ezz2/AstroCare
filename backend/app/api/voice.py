from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.voice import VoiceParseResponse
from app.services.measurement_extraction import extract_measurements
from app.services.speech_recognition import transcribe_audio

router = APIRouter()


@router.post("/parse", response_model=VoiceParseResponse)
async def parse_voice(audio: UploadFile = File(...)):
    content_type = (audio.content_type or "").lower()
    extension = (audio.filename or "").rsplit(".", 1)[-1].lower()
    if content_type not in settings.allowed_audio_types and extension not in settings.allowed_audio_extensions:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported audio format.",
        )

    content = await audio.read(settings.max_audio_bytes + 1)
    if len(content) > settings.max_audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file is too large.",
        )
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded audio file is empty.",
        )

    try:
        transcript = await transcribe_audio(content, extension or "webm")
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice transcription is temporarily unavailable.",
        ) from error

    extracted = extract_measurements(transcript)
    if not extracted.has_measurements:
        return VoiceParseResponse(
            success=False,
            status="not_understood",
            recognized_text=transcript,
            measurements=None,
            message="I couldn't understand your measurements. Please say that again.",
            warnings=extracted.warnings,
        )

    return VoiceParseResponse(
        success=True,
        status="completed",
        recognized_text=transcript,
        measurements=extracted.measurements,
        warnings=extracted.warnings,
    )
