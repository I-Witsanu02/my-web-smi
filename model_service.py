from __future__ import annotations

import base64
import io
import json
import threading
import os
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageOps
import timm
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as T


APP_ROOT = Path(__file__).resolve().parent
REGISTRY_PATH = APP_ROOT / "model_registry.json"
ROI_ORDER = ["Carpal", "DP3", "MC1", "MP3", "MP5", "PP1", "PP3", "Radius", "Ulna"]
IMAGE_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

PREPROCESS = T.Compose(
    [
        T.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        T.ToTensor(),
        T.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ]
)

def prepare_roi(image, model_id):
    image = image.convert('RGB')
    if 'aspect-pad' in model_entry(model_id).get('input_protocol', ''):
        import cv2
        a = np.asarray(image)
        h, w = a.shape[:2]
        scale = min(224 / w, 224 / h)
        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        resized = cv2.resize(a, (nw, nh), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
        border = np.concatenate((a[0], a[-1], a[:, 0], a[:, -1]), axis=0)
        canvas = np.empty((224, 224, 3), dtype=np.uint8)
        canvas[:] = np.median(border, axis=0).astype(np.uint8)
        x, y = (224 - nw) // 2, (224 - nh) // 2
        canvas[y:y+nh, x:x+nw] = resized
        image = Image.fromarray(canvas)
    if 'A2_MORPHSAFE_V2' in model_entry(model_id).get('input_protocol',''):
        from model_preprocessing import apply_controlled_preprocess
        image=apply_controlled_preprocess(image)
    return PREPROCESS(image)


class GenderFiLM(nn.Module):
    def __init__(self, feature_dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(1, feature_dim * 2),
            nn.GELU(),
            nn.Linear(feature_dim * 2, feature_dim * 2),
        )

    def forward(self, features: torch.Tensor, gender: torch.Tensor) -> torch.Tensor:
        gamma, beta = self.net(gender.view(-1, 1)).chunk(2, dim=-1)
        return features * (1 + 0.1 * torch.tanh(gamma)) + 0.1 * beta


class MultiROIBoneAgeNet(nn.Module):
    """Exact deployment architecture used by PRE2 and FULL18 checkpoints."""

    def __init__(self, backbone_name='focalnet_tiny_srf', n_h2=9, n_h3=6):
        super().__init__()
        self.backbone_name=backbone_name
        self.backbone = timm.create_model(
            backbone_name,
            pretrained=False,
            num_classes=0,
            drop_path_rate=0.10,
        )
        backbone_features = int(self.backbone.num_features)
        feature_dim = 384
        self.proj = nn.Sequential(
            nn.Linear(backbone_features, feature_dim),
            nn.LayerNorm(feature_dim),
            nn.GELU(),
            nn.Dropout(0.12),
        )
        self.pos = nn.Parameter(torch.randn(1, len(ROI_ORDER), feature_dim) * 0.02)
        layer = nn.TransformerEncoderLayer(
            d_model=feature_dim,
            nhead=4,
            dim_feedforward=feature_dim * 4,
            dropout=0.10,
            activation="gelu",
            batch_first=True,
        )
        self.roi_transformer = nn.TransformerEncoder(layer, num_layers=2)
        self.gate = nn.Linear(feature_dim, 1)
        self.gender = GenderFiLM(feature_dim)
        self.dropout = nn.Dropout(0.30)
        self.h2_head = nn.Sequential(nn.LayerNorm(feature_dim), nn.Dropout(0.25), nn.Linear(feature_dim, n_h2))
        self.h3_head = nn.Sequential(nn.LayerNorm(feature_dim), nn.Dropout(0.25), nn.Linear(feature_dim, n_h3))
        self.h2_guide = nn.Linear(n_h2, 64)
        self.h3_guide = nn.Linear(n_h3, 64)
        self.reg = nn.Sequential(
            nn.LayerNorm(feature_dim + 128),
            nn.Dropout(0.30),
            nn.Linear(feature_dim + 128, 256),
            nn.GELU(),
            nn.Dropout(0.20),
            nn.Linear(256, 128),
            nn.GELU(),
            nn.Linear(128, 1),
        )

    def _backbone_2d(self, images: torch.Tensor) -> torch.Tensor:
        output = self.backbone(images)
        if isinstance(output, (list, tuple)):
            output = output[-1]
        if output.ndim == 4:
            output = F.adaptive_avg_pool2d(output, 1).flatten(1)
        elif output.ndim == 3:
            output = output.mean(1)
        return output

    def forward(self, rois: torch.Tensor, gender: torch.Tensor) -> dict[str, torch.Tensor]:
        batch, number, channels, height, width = rois.shape
        raw = self._backbone_2d(rois.reshape(batch * number, channels, height, width))
        raw = raw.reshape(batch, number, -1)
        encoded = self.roi_transformer(self.proj(raw) + self.pos)
        gate = F.softmax(self.gate(encoded).squeeze(-1), dim=1)
        fused = (encoded * gate.unsqueeze(-1)).sum(1)
        fused = self.gender(fused, gender)
        fused = self.dropout(fused)
        h2_logits = self.h2_head(fused)
        h3_logits = self.h3_head(fused)
        h2_guide = F.gelu(self.h2_guide(F.softmax(h2_logits, -1)))
        h3_guide = F.gelu(self.h3_guide(F.softmax(h3_logits, -1)))
        pred_norm = torch.sigmoid(self.reg(torch.cat([fused, h2_guide, h3_guide], dim=-1)).squeeze(-1))
        return {
            "pred_months": pred_norm * 240.0,
            "roi_gate": gate,
            "h2_logits": h2_logits,
            "h3_logits": h3_logits,
        }


def load_registry() -> dict[str, Any]:
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def model_entry(model_id: str) -> dict[str, Any]:
    registry = load_registry()
    for item in registry["models"]:
        if item["id"] == model_id:
            return item
    raise KeyError(f"Unknown model: {model_id}")


def age_label(months: float) -> str:
    rounded = max(0, int(round(months)))
    years, remaining = divmod(rounded, 12)
    return f"{years} ปี {remaining} เดือน"


def image_data_url(image: Image.Image, image_format: str = "JPEG") -> str:
    buffer = io.BytesIO()
    image.save(buffer, format=image_format, quality=90)
    mime = "image/jpeg" if image_format.upper() == "JPEG" else "image/png"
    return f"data:{mime};base64,{base64.b64encode(buffer.getvalue()).decode('ascii')}"


class BoneAgeService:
    def __init__(self) -> None:
        # CPU is a supported zero-cost deployment mode. The environment
        # override also makes performance testing reproducible on machines
        # that happen to have a CUDA-capable card.
        requested_device = os.getenv("BONEAGE_DEVICE", "auto").strip().lower()
        if requested_device == "cpu":
            self.device = torch.device("cpu")
        elif requested_device in {"cuda", "gpu"}:
            if not torch.cuda.is_available():
                raise RuntimeError("BONEAGE_DEVICE=cuda was requested but CUDA is unavailable")
            self.device = torch.device("cuda")
        elif requested_device == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            raise ValueError("BONEAGE_DEVICE must be one of: auto, cpu, cuda")
        self._models: dict[str, MultiROIBoneAgeNet] = {}
        self._detector = None
        self._lock = threading.RLock()

    def get_model(self, model_id: str) -> MultiROIBoneAgeNet:
        entry = model_entry(model_id)
        if entry["status"] not in {"active", "reference"}:
            raise ValueError(f"Model {model_id} is archived and is not deployment-safe")
        with self._lock:
            if model_id not in self._models:
                checkpoint_file = resolve_checkpoint(entry)
                if not checkpoint_file.is_file():
                    raise FileNotFoundError(checkpoint_file)
                # Only allow the known torch version metadata class; never unsafe pickle.
                with torch.serialization.safe_globals([torch.torch_version.TorchVersion]):
                    checkpoint = torch.load(checkpoint_file,map_location='cpu',weights_only=True,mmap=True)
                state=checkpoint['model_state']
                model = MultiROIBoneAgeNet(entry.get('backbone','focalnet_tiny_srf'),state['h2_head.2.weight'].shape[0],state['h3_head.2.weight'].shape[0])
                model.load_state_dict(checkpoint["model_state"], strict=True)
                model.eval().to(self.device)
                for module in model.modules():
                    if hasattr(module,'inplace'):module.inplace=False
                # Bound memory on the laptop. Local variables keep an in-flight model alive.
                self._models.clear()
                self._models[model_id] = model
            return self._models[model_id]

    def get_detector(self):
        with self._lock:
            if self._detector is None:
                from ultralytics import YOLO

                detector_entry = load_registry()["detector"]
                checkpoint_file = resolve_checkpoint(detector_entry)
                if not checkpoint_file.is_file():
                    raise FileNotFoundError(checkpoint_file)
                self._detector = YOLO(str(checkpoint_file))
            return self._detector

    def _validate_age(self, model_id: str, chronological_age_months: float | None) -> None:
        if chronological_age_months is None:
            return
        low, high = model_entry(model_id)["eligible_age_years"]
        years = chronological_age_months / 12.0
        if not (low <= years < high + 1):
            raise ValueError(f"{model_entry(model_id)['display_name']} รองรับอายุ {low}–{high} ปี")

    def predict_roi_images(
        self,
        roi_images: dict[str, Image.Image],
        male: float,
        model_id: str = "full18_focalnet_b8",
        chronological_age_months: float | None = None,
        include_pixel_attribution: bool = False,
        xai_method: str = 'GradCAM',
        scorecam_topk: int = 16,
    ) -> dict[str, Any]:
        self._validate_age(model_id, chronological_age_months)
        missing = [roi for roi in ROI_ORDER if roi not in roi_images]
        if missing:
            raise ValueError(f"ROI ไม่ครบ 9 จุด ขาด: {', '.join(missing)}")
        tensors = [prepare_roi(roi_images[roi], model_id) for roi in ROI_ORDER]
        rois = torch.stack(tensors).unsqueeze(0).to(self.device)
        gender = torch.tensor([float(male)], dtype=torch.float32, device=self.device)
        model = self.get_model(model_id)
        pixel_attribution = None
        cam_metadata=None
        if include_pixel_attribution and xai_method!='SmoothGrad':
            from cam_service import compute_cam
            with self._lock,torch.enable_grad():
                output,pixel_attribution,cam_metadata=compute_cam(model,rois,gender,xai_method,scorecam_topk)
        elif include_pixel_attribution:
            with self._lock, torch.enable_grad(), torch.random.fork_rng(
                devices=[self.device.index or 0] if self.device.type == "cuda" else []
            ):
                torch.manual_seed(42)
                original = rois.detach().requires_grad_(True)
                output = model(original, gender)
                gradient = torch.autograd.grad(output["pred_months"].sum(), original)[0]
                attribution = (gradient * original).abs()
                # SmoothGrad reduces unstable pixel speckle while every sample
                # remains derived from this patient's own ROI tensor.
                for _ in range(5):
                    noisy = (rois.detach() + torch.randn_like(rois) * 0.08).requires_grad_(True)
                    noisy_output = model(noisy, gender)
                    noisy_gradient = torch.autograd.grad(noisy_output["pred_months"].sum(), noisy)[0]
                    attribution = attribution + (noisy_gradient * noisy).abs()
                attribution = (attribution / 6.0).mean(dim=2)[0]
                pixel_attribution = attribution.detach().float().cpu().numpy()
        else:
            with self._lock, torch.inference_mode():
                output = model(rois, gender)
        pred_months = float(output["pred_months"].detach().cpu().item())
        gates = output["roi_gate"].detach().cpu().numpy()[0]
        h2_index = int(output["h2_logits"].argmax(dim=-1).detach().cpu().item())
        h3_index = int(output["h3_logits"].argmax(dim=-1).detach().cpu().item())
        entry = model_entry(model_id)
        result = {
            "model_id": model_id,
            "model_name": entry["display_name"],
            "predicted_months": round(pred_months, 3),
            "predicted_age": age_label(pred_months),
            "roi_gate": {roi: round(float(gates[index]), 6) for index, roi in enumerate(ROI_ORDER)},
            "auxiliary_groups": {"h2_index": h2_index, "h3_index": h3_index},
            "validation_mae_months": entry.get("validation_mae_months"),
            "device": str(self.device),
            "preprocess": entry.get("input_protocol", "stretch224_matching_training"),
            "research_only": True,
        }
        if pixel_attribution is not None:
            result["_pixel_attribution"] = pixel_attribution
            result['_xai_metadata']=cam_metadata or {'version':'smoothgrad-legacy-v1','method':'SmoothGrad','samples':6,'gate_weighted_display':False,'faithfulness_validated':False}
        return result

    def predict_full_hand(
        self,
        image: Image.Image,
        male: float,
        model_id: str,
        chronological_age_months: float | None,
        reviewed_boxes: dict[str, list[float]] | None = None,
        xai_method: str = 'GradCAM',
        scorecam_topk: int = 16,
        detect_only: bool = False,
    ) -> dict[str, Any]:
        detector_entry = load_registry()["detector"]
        rgb = ImageOps.exif_transpose(image).convert("RGB")
        result = None if reviewed_boxes and all(roi in reviewed_boxes for roi in ROI_ORDER) else self.get_detector().predict(
            np.asarray(rgb), imgsz=int(detector_entry["imgsz"]), conf=0.20,
            iou=0.70, max_det=50, verbose=False,
            device=0 if self.device.type == "cuda" else "cpu",
        )[0]

        best_by_roi: dict[str, dict[str, Any]] = {}
        if result is not None and result.boxes is not None:
            xyxy = result.boxes.xyxy.detach().cpu().numpy()
            confs = result.boxes.conf.detach().cpu().numpy()
            classes = result.boxes.cls.detach().cpu().numpy().astype(int)
            for box, confidence, class_id in zip(xyxy, confs, classes):
                if not 0 <= class_id < len(ROI_ORDER):
                    continue
                roi = str(result.names[class_id])
                if roi not in ROI_ORDER:
                    raise ValueError(f'Unexpected detector label: {roi}')
                candidate = {
                    "roi": roi,
                    "confidence": float(confidence),
                    "box": [float(value) for value in box],
                    "source": "detector",
                }
                if roi not in best_by_roi or candidate["confidence"] > best_by_roi[roi]["confidence"]:
                    best_by_roi[roi] = candidate

        # Detector output remains the baseline; expert edits replace only the
        # explicitly reviewed regions so an edit to one ROI cannot erase the other eight.
        if reviewed_boxes:
            for roi, box in reviewed_boxes.items():
                if roi in ROI_ORDER and len(box) == 4:
                    values = [float(v) for v in box]
                    if max(values) <= 1.5:
                        values = [values[0] * rgb.width, values[1] * rgb.height, values[2] * rgb.width, values[3] * rgb.height]
                    if not all(np.isfinite(values)) or not (0<=values[0]<values[2]<=rgb.width and 0<=values[1]<values[3]<=rgb.height):
                        raise ValueError(f'Invalid original-image ROI coordinates: {roi}')
                    previous=best_by_roi.get(roi)
                    best_by_roi[roi] = {"roi": roi, "confidence": previous['confidence'] if previous else 0.0, "detector_confidence": previous['confidence'] if previous else None, "box": values, "source": "expert_review"}

        missing = [roi for roi in ROI_ORDER if roi not in best_by_roi]
        low_confidence = [
            roi for roi, item in best_by_roi.items()
            if item.get("source") != "expert_review" and item["confidence"] < 0.50
        ]
        canvas = rgb.copy()
        drawer = ImageDraw.Draw(canvas)
        colors = ["#12b5cb", "#f59e0b", "#22c55e", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#3b82f6", "#14b8a6"]
        roi_images: dict[str, Image.Image] = {}
        detections = []
        for index, roi in enumerate(ROI_ORDER):
            if roi not in best_by_roi:
                continue
            item = best_by_roi[roi]
            x1, y1, x2, y2 = item["box"]
            left = max(0, int(round(x1)))
            top = max(0, int(round(y1)))
            right = min(rgb.width, int(round(x2)))
            bottom = min(rgb.height, int(round(y2)))
            if right <= left or bottom <= top:
                missing.append(roi)
                continue
            roi_images[roi] = rgb.crop((left, top, right, bottom))
            drawer.rectangle((left, top, right, bottom), outline=colors[index], width=max(2, rgb.width // 350))
            score_label = "expert" if item.get("source") == "expert_review" else f"{item['confidence']:.2f}"
            drawer.text((left + 3, max(0, top - 14)), f"{roi} {score_label}", fill=colors[index])
            detections.append({**item, "crop_data_url": image_data_url(roi_images[roi])})

        qc_status = "PASS" if not missing and not low_confidence and len(roi_images) == len(ROI_ORDER) else "REVIEW"

        payload: dict[str, Any] = {
            "qc_status": qc_status,
            "missing_rois": sorted(set(missing)),
            "low_confidence_rois": low_confidence,
            "detected_count": len(roi_images),
            "detections": detections,
            "annotated_image": image_data_url(canvas),
            "detector": detector_entry["display_name"],
            "protocol_warning": (
                "ตรวจด้วย YOLO V2 E53 และเติมขอบ ROI ตามสัดส่วน ต้องให้ผู้ทบทวนตรวจตำแหน่ง "
                "ผล validation เป็นผลชุด ROI ที่ตรวจแล้ว ไม่ใช่การรับรองผล end-to-end ในผู้ป่วยใหม่"
            ),
            "research_only": True,
        }
        if detect_only:
            payload['stage']='roi_review'
            return payload
        if qc_status != "PASS" or len(roi_images) != len(ROI_ORDER):
            payload["message"] = "ROI ยังไม่ผ่าน gate จึงหยุดก่อนโมเดลอายุและส่งให้ตรวจทบทวน"
            return payload
        payload["prediction"] = self.predict_roi_images(
            roi_images,
            male=male,
            model_id=model_id,
            chronological_age_months=chronological_age_months,
            include_pixel_attribution=True,
            xai_method=xai_method,
            scorecam_topk=scorecam_topk,
        )
        attribution = payload["prediction"].pop("_pixel_attribution")
        cam_metadata=payload['prediction'].pop('_xai_metadata')
        import cv2

        # Compose patient-specific Input × Gradient maps back into the original
        # ROI coordinates. Aspect padding is removed before spatial restoration.
        base = np.asarray(rgb).astype(np.float32)
        color_accumulator = np.zeros_like(base)
        alpha_accumulator = np.zeros((rgb.height, rgb.width), dtype=np.float32)
        for index, roi in enumerate(ROI_ORDER):
            item = best_by_roi[roi]
            x1, y1, x2, y2 = [int(round(v)) for v in item["box"]]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(rgb.width, x2), min(rgb.height, y2)
            crop_width, crop_height = x2 - x1, y2 - y1
            saliency = attribution[index]
            if 'aspect-pad' in model_entry(model_id).get('input_protocol', ''):
                scale = min(IMAGE_SIZE / crop_width, IMAGE_SIZE / crop_height)
                resized_width = max(1, round(crop_width * scale))
                resized_height = max(1, round(crop_height * scale))
                pad_x = (IMAGE_SIZE - resized_width) // 2
                pad_y = (IMAGE_SIZE - resized_height) // 2
                saliency = saliency[pad_y:pad_y + resized_height, pad_x:pad_x + resized_width]
            saliency = cv2.resize(saliency, (crop_width, crop_height), interpolation=cv2.INTER_CUBIC)
            # Restore true spatial CAMs; no extra blur or second multiplication by ROI gate.
            upper = float(saliency.max())
            lower = float(saliency.min())
            saliency = np.clip((saliency - lower) / max(upper - lower, 1e-8), 0.0, 1.0)
            colored = cv2.cvtColor(
                cv2.applyColorMap(np.uint8(saliency * 255), cv2.COLORMAP_TURBO),
                cv2.COLOR_BGR2RGB,
            ).astype(np.float32)
            alpha = saliency * 0.72
            region_alpha = alpha_accumulator[y1:y2, x1:x2]
            replace = alpha > region_alpha
            color_accumulator[y1:y2, x1:x2][replace] = colored[replace]
            region_alpha[replace] = alpha[replace]

        composite = base * (1.0 - alpha_accumulator[..., None]) + color_accumulator * alpha_accumulator[..., None]
        display_method=xai_method if xai_method!='SmoothGrad' else 'SmoothGrad Input × Gradient (legacy)'
        payload["xai_image"] = image_data_url(Image.fromarray(np.uint8(np.clip(composite, 0, 255))), "PNG")
        rgba = np.concatenate([np.clip(color_accumulator, 0, 255), (alpha_accumulator * 255)[..., None]], axis=2).astype(np.uint8)
        payload['xai_layer'] = image_data_url(Image.fromarray(rgba), 'PNG')
        payload['xai_method']=display_method
        payload['prediction']['xai_method']=display_method
        payload['xai_metadata']={**cam_metadata,'spatial_restore':'inverse aspect-padding then bilinear to original box','display_normalization':'per-ROI min/max; not comparable magnitude between ROIs'}
        return payload


SERVICE = BoneAgeService()
def resolve_checkpoint(entry: dict[str, Any]) -> Path:
    env_name = entry.get('checkpoint_env')
    value = os.getenv(env_name, '') if env_name else ''
    path = Path(value or entry['checkpoint'])
    return path if path.is_absolute() else APP_ROOT / path
