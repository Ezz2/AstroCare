# AstroCare Voice Backend

## Local setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:ASTROCARE_CORS_ORIGINS="http://localhost:5173"
uvicorn app.main:app --reload
```

The first request downloads the configured `faster-whisper` model. The default is
`base.en` with CPU-friendly `int8` inference.

## Configuration

- `ASTROCARE_CORS_ORIGINS`: comma-separated frontend origins.
- `ASTROCARE_MAX_AUDIO_BYTES`: upload limit, default 10 MiB.
- `ASTROCARE_WHISPER_MODEL`: default `base.en`.
- `ASTROCARE_WHISPER_DEVICE`: default `cpu`.
- `ASTROCARE_WHISPER_COMPUTE_TYPE`: default `int8`.

The endpoint is `POST /api/v1/voice/parse` with a multipart `audio` file. The
backend only transcribes and extracts measurements; Supabase writes remain in
the React frontend.
