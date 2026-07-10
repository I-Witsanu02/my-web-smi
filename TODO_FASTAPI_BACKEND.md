# FastAPI / PyTorch Backend Integration TODO

1. Replace Next.js mock API handlers with typed service clients that call `FASTAPI_BASE_URL`.
2. Add authenticated calls from Next.js route handlers to the FastAPI service.
3. Replace FastAPI mock inference in `backend/app/services/model_service.py` with FocalNet-Tiny / Multi-ROI model code.
4. Load an existing checkpoint from `MODEL_CHECKPOINT_PATH`; do not add training code to this service.
5. Implement real preprocessing for DICOM/JPG/PNG, left-hand orientation checks, contrast/blur scoring, and marker/text detection.
6. Implement real XAI generators for Grad-CAM, Grad-CAM++, Score-CAM, and Eigen-CAM in `backend/app/services/xai_service.py`.
7. Stream original X-rays, ROI crops, heatmaps, and reports to MinIO/S3 and persist object pointers in PostgreSQL.
8. Standardize DTOs between Next.js, FastAPI, Prisma models, and report export payloads.
9. Persist audit events for login, case view/edit, upload, prediction, report generation, and report download.
10. Add role enforcement middleware in Next.js and backend authorization checks in FastAPI.
11. Add model registry sync from Prisma `ModelVersion` to the inference service.
12. Add background jobs for XAI heatmap generation and PDF report rendering.
13. Add monitoring for inference failures, latency, drift placeholders, and age/sex data distribution.
