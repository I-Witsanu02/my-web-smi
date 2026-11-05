"""Synthetic detector-interface tests, not clinical results."""
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from PIL import Image
from model_service import BoneAgeService
class RoiStageTests(unittest.TestCase):
    def test_detection_does_not_run_age_model(self):
        service=BoneAgeService();detector=SimpleNamespace(predict=lambda *a,**k:[SimpleNamespace(boxes=None)])
        with patch.object(service,'get_detector',return_value=detector),patch.object(service,'predict_roi_images',side_effect=AssertionError('Age must not run during ROI review')):
            r=service.predict_full_hand(Image.new('RGB',(32,48)),0,'full18_focalnet_b8',None,detect_only=True)
        self.assertNotIn('prediction',r);self.assertNotIn('xai_image',r);self.assertEqual(r['stage'],'roi_review');self.assertEqual(len(r['missing_rois']),9)
    def test_missing_roi_stops_prediction(self):
        service=BoneAgeService();detector=SimpleNamespace(predict=lambda *a,**k:[SimpleNamespace(boxes=None)])
        with patch.object(service,'get_detector',return_value=detector),patch.object(service,'predict_roi_images',side_effect=AssertionError('Incomplete ROI must not predict')):
            r=service.predict_full_hand(Image.new('RGB',(32,48)),0,'full18_focalnet_b8',None)
        self.assertNotIn('prediction',r);self.assertEqual(r['qc_status'],'REVIEW')
if __name__=='__main__':unittest.main()
