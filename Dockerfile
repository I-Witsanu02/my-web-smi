FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

WORKDIR /app
COPY requirements.deploy.txt ./
RUN pip install --no-cache-dir -r requirements.deploy.txt

COPY . /app
ENV BONEAGE_FULL18_CHECKPOINT=/app/models/focalnet_full18.pt \
    BONEAGE_YOLO_CHECKPOINT=/app/models/yolo_roi9.pt \
    PYTHONUNBUFFERED=1

EXPOSE 8766
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8766"]
