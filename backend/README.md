# FastAPI Bone Age Backend

Mock-first backend service for the Explainable Bone Age Assessment System.

The service does not train a model and does not provide diagnosis. Every clinical response includes:

**Clinical decision support only. Not a diagnosis.**

## Endpoints

- `GET /health`
- `POST /quality-check`
- `POST /roi-detect`
- `POST /predict`
- `POST /xai`
- `POST /report-export`

All `POST` endpoints accept either JSON:

```json
{
  "case_id": "BA-9412-A",
  "image_path": "backend/storage/uploads/example.png",
  "metadata": {
    "chronological_age_months": 120,
    "sex": "male"
  }
}
```

Or multipart form data with fields:

- `file`
- `case_id`
- `image_path`
- `chronological_age_months`
- `sex`

## Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs`.

## Model Checkpoint

Set `MODEL_CHECKPOINT_PATH` later when a trained checkpoint exists:

```bash
MODEL_CHECKPOINT_PATH="D:\models\focalnet_tiny_multi_roi.pt"
MODEL_VERSION="FocalNet-Tiny v6.2"
```

If the checkpoint is missing or cannot be loaded, the service automatically uses mock inference.

## Future Model Hooks

The service layer is ready for:

- FocalNet-Tiny backbone loading
- Multi-ROI crop model
- Grad-CAM
- Grad-CAM++
- Score-CAM
- Eigen-CAM
- Heatmap artifact storage
- Structured report export
