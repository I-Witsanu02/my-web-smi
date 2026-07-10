# Explainable Bone Age Assessment System

Production-style Next.js App Router conversion of the Stitch static prototype for a clinical decision-support research workflow.

This is not a medical diagnosis system. All clinical outputs show: **Clinical decision support only. Not a medical diagnosis.**

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Reusable React component primitives
- Recharts
- Prisma ORM with PostgreSQL schema
- Mock API layer designed for future FastAPI/PyTorch integration
- S3-compatible storage design for X-rays, ROI crops, heatmaps, and reports

## Routes

- `/login`
- `/screening`
- `/cases`
- `/cases/new`
- `/cases/BA-9412-A/upload`
- `/cases/BA-9412-A/roi`
- `/cases/BA-9412-A/result`
- `/cases/BA-9412-A/xai`
- `/cases/BA-9412-A/report`
- `/demo/bone-age`
- `/admin/models`
- `/audit`

## API Placeholders

- `POST /api/screening`
- `POST /api/upload`
- `POST /api/roi-detect`
- `POST /api/predict`
- `POST /api/xai`
- `POST /api/reports`
- `GET /api/cases`
- `GET /api/cases/[id]`

Each endpoint returns mock data plus the clinical disclaimer and a note about replacing the mock handler with a backend service call.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

## FastAPI Backend

The mock-first AI backend lives in `backend/` and exposes:

- `GET /health`
- `POST /quality-check`
- `POST /roi-detect`
- `POST /predict`
- `POST /xai`
- `POST /report-export`

Run it separately:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs`.

Set `MODEL_CHECKPOINT_PATH` later to load an existing PyTorch checkpoint. If no checkpoint is available, the backend uses mock inference.

For database work:

```bash
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
```

## Environment

Create `.env` with:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bone_age"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_REGION="us-east-1"
FASTAPI_BASE_URL="http://localhost:8000"
MODEL_CHECKPOINT_PATH=""
MODEL_VERSION="FocalNet-Tiny v6.2"
```

## Mock Case

The current mock flow uses anonymized Case ID `BA-9412-A`:

- Chronological age: `10y 0m`
- Predicted bone age: `9y 8m`
- BA-CA: `-4 months`
- Uncertainty: `+/- 1.8 months`
- Model: `FocalNet-Tiny v6.2`
- Sex: `MALE`
- ROI importance: `PP3 0.88`, `Carpal 0.82`, `MP3 0.74`, `DP3 0.68`, `Radius 0.61`, `Ulna 0.52`

## Local Demo Assets

The `/demo/bone-age` route and case workflow pages use local demo images from:

- `public/demo/bone-age/xrays/`
- `public/demo/bone-age/roi-detections/`
- `public/demo/bone-age/xai/`
- `public/demo/bone-age/infographics/`

Demo panel data lives in `src/lib/boneage-demo-data.ts`, and reusable panels live in `src/components/boneage-demo/BoneAgeDemoPanels.tsx`.

## Important Safety Constraints

- No model training is implemented.
- No real medical diagnosis is implemented.
- No real patient names are collected.
- Role design includes admin, clinician, researcher, and demo user.
- Important actions are routed through an audit logging helper.
