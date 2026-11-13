# AstroCare

AstroCare is an astronaut health-monitoring frontend built with React and Vite.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

To run checks or create a production build, run `npm run lint` or `npm run build`
from the `frontend` directory.

The frontend reads the voice backend URL from `VITE_API_BASE_URL`. Copy
`frontend/.env.example` to a local environment file and set it to the URL of
the FastAPI service.

## Voice backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:ASTROCARE_CORS_ORIGINS="http://localhost:5173"
uvicorn app.main:app --reload
```

The backend exposes `POST /api/v1/voice/parse` for audio transcription and
measurement extraction. It never writes to Supabase; the React frontend
continues to save reviewed measurements through the existing data layer.

## Project structure

- `frontend/` - React application, static assets, and frontend tooling
- `backend/` - reserved for backend implementation
- `supabase/` - existing Supabase database migrations
"# AstroCare" 
