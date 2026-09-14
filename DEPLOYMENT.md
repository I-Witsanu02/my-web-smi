# Deploying the Bone Age research application

The application has two services by design:

| Service | Where it runs | What it does |
| --- | --- | --- |
| Web application | Vercel | Delivers the React interface over HTTPS. |
| Inference API | Local CPU, GPU host, or secure tunnel | Runs the real YOLO 9-ROI detector, FocalNet checkpoint, and XAI computation. |

Vercel must not host the PyTorch model. Model files and Python inference are outside the scope of a static Vite deployment. The inference service is supplied in this repository as `Dockerfile` and can also run with `start_cpu.cmd` on a local computer.

## 1. Deploy the GPU inference API

Use a GPU-enabled Docker host. Clone this repository with Git LFS enabled so these tracked files are real checkpoints rather than LFS pointer files:

```text
models/focalnet_full18.pt
models/yolo_roi9.pt
```

Build and run from the repository root, mounting a persistent directory for `web/runtime`:

```bash
docker build -t boneage-gpu-api .
docker run --gpus all --restart unless-stopped -p 8766:8766 \
  -v boneage-runtime:/app/runtime \
  -e BONEAGE_USERNAME="choose-a-username" \
  -e BONEAGE_PASSWORD="choose-a-long-password" \
  -e BONEAGE_SESSION_SECRET="generate-a-long-random-secret" \
  -e BONEAGE_ALLOWED_ORIGINS="https://YOUR-PROJECT.vercel.app" \
  -e BONEAGE_HTTPS=1 \
  boneage-gpu-api
```

Place an HTTPS reverse proxy in front of port 8766, then verify:

```text
https://YOUR-GPU-API/api/health
```

The response must report `"model_available": true`. Do not continue until it does.

## 2. Deploy the web application on Vercel

Set Vercel **Root Directory** to `.`. Vercel then uses `package.json` and `vercel.json`; Python, checkpoints, notebooks, and medical images are not uploaded to Vercel.

In Vercel Project Settings, set the Production environment variable:

```text
VITE_API_BASE_URL=https://YOUR-GPU-API
```

Redeploy the `main` branch. Vercel runs `npm ci`, builds the Vite app, and serves `dist`.

## 3. End-to-end acceptance check

1. Open the Vercel URL and sign in with the backend credentials.
2. Upload a de-identified left hand/wrist JPG or PNG.
3. Confirm the result says `9/9` ROI and shows a FocalNet age estimate.
4. Confirm the XAI image is returned for that same upload.
5. Verify the GPU API log shows one YOLO and one FocalNet request.

This is a research prototype. It is not a diagnostic device or a substitute for clinical review.
