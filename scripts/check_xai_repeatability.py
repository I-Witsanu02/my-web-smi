"""Real-checkpoint repeatability check; not a faithfulness certification."""
import sys
from pathlib import Path
import numpy as np
import torch
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from model_service import SERVICE, ROI_ORDER

root = Path(sys.argv[1])
images = {}
for roi in ROI_ORDER:
    with Image.open(root / (roi + '.png')) as image:
        images[roi] = image.convert('RGB')
SERVICE.get_model('full18_focalnet_b8')
torch.manual_seed(123)
before = torch.random.get_rng_state().clone()
a = SERVICE.predict_roi_images(images, 0, include_pixel_attribution=True)
b = SERVICE.predict_roi_images(images, 0, include_pixel_attribution=True)
assert a['predicted_months'] == b['predicted_months']
assert np.allclose(a['_pixel_attribution'], b['_pixel_attribution'], rtol=1e-5, atol=1e-7)
assert np.isfinite(a['_pixel_attribution']).all()
assert a['_pixel_attribution'].max() > 0
assert torch.equal(before, torch.random.get_rng_state())
print({'repeatable': True, 'finite_nonzero_attribution': True, 'predicted_months': a['predicted_months']})
