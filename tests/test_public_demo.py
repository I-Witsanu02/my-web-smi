from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

import app as app_module


def png_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("L", (512, 512), color=96).save(buffer, format="PNG")
    return buffer.getvalue()


class PublicDemoTest(unittest.TestCase):
    def setUp(self):
        app_module.DEMO_REQUESTS.clear()
        self.client = TestClient(app_module.app)

    def test_demo_does_not_require_login_or_persist_upload(self):
        fake_result = {
            "qc_status": "PASS",
            "missing_rois": [],
            "low_confidence_rois": [],
            "detected_count": 9,
            "detections": [{"roi": "Carpal", "confidence": 0.9, "box": [1, 1, 20, 20], "crop_data_url": "data:image/png;base64,AA=="}],
            "annotated_image": "data:image/png;base64,AA==",
            "full_hand_url": "",
            "detector": "internal-detector-name",
            "protocol_warning": "internal protocol detail",
            "research_only": True,
            "xai_method": "internal-xai-method",
            "xai_metadata": {"samples": 6},
            "prediction": {
                "model_id": "internal-model-id",
                "model_name": "internal-model-name",
                "device": "cpu",
                "preprocess": "internal-preprocess",
                "roi_gate": {"Carpal": 1.0},
                "predicted_age": "10 ปี 2 เดือน",
                "predicted_months": 122.0,
                "validation_mae_months": 6.58,
            },
        }
        with TemporaryDirectory() as temp_dir, \
                patch.object(app_module, "RUNTIME_ASSETS", Path(temp_dir)), \
                patch.object(app_module.SERVICE, "predict_full_hand", return_value=fake_result):
            response = self.client.post(
                "/api/demo/predict",
                data={
                    "sex": "female",
                    "chronological_age_months": "120",
                    "height_cm": "140",
                    "weight_kg": "35",
                },
                files={"image": ("hand.png", png_bytes(), "image/png")},
            )
            self.assertEqual(response.status_code, 200)
            payload = response.json()
            self.assertTrue(payload["demo"])
            self.assertFalse(payload["image_retained"])
            self.assertFalse(payload["anthropometrics_used_by_model"])
            self.assertNotIn("crop_data_url", payload["detections"][0])
            self.assertNotIn("detector", payload)
            self.assertNotIn("protocol_warning", payload)
            self.assertNotIn("xai_method", payload)
            self.assertNotIn("xai_metadata", payload)
            self.assertNotIn("model_id", payload["prediction"])
            self.assertNotIn("model_name", payload["prediction"])
            self.assertNotIn("device", payload["prediction"])
            self.assertNotIn("preprocess", payload["prediction"])
            self.assertNotIn("roi_gate", payload["prediction"])
            self.assertEqual(payload["prediction"]["predicted_months"], 122.0)
            self.assertEqual(list(Path(temp_dir).iterdir()), [])

    def test_demo_rejects_non_image(self):
        response = self.client.post(
            "/api/demo/predict",
            data={"sex": "male", "chronological_age_months": "120"},
            files={"image": ("note.txt", b"not an image", "text/plain")},
        )
        self.assertEqual(response.status_code, 415)


if __name__ == "__main__":
    unittest.main()
