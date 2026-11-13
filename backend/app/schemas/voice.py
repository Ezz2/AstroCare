from typing import Optional

from pydantic import BaseModel, Field


class Measurements(BaseModel):
    heart_rate: Optional[float] = Field(default=None, gt=0)
    spo2: Optional[float] = Field(default=None, ge=0, le=100)
    systolic_bp: Optional[float] = Field(default=None, gt=0)
    diastolic_bp: Optional[float] = Field(default=None, gt=0)
    body_temperature: Optional[float] = Field(default=None, gt=0)
    blood_glucose: Optional[float] = Field(default=None, gt=0)
    sleep_duration: Optional[float] = Field(default=None, ge=0)


class VoiceParseResponse(BaseModel):
    success: bool
    status: str
    recognized_text: str
    measurements: Optional[Measurements] = None
    message: Optional[str] = None
    warnings: list[str] = Field(default_factory=list)
