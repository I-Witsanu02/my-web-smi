from PIL import Image
import numpy as np
PREPROCESS_MODE='A2_MORPHSAFE_V2'
def apply_controlled_preprocess(image, mode=PREPROCESS_MODE, return_audit=False):
    """A2V2: conservative denoise + local contrast with median tone preservation.

    The operation never resizes an ROI. Flat aspect-pad pixels are restored after
    enhancement so CLAHE cannot create artificial borders around the anatomy.
    """
    mode = str(mode).upper()
    gray = np.asarray(image.convert("L"), dtype=np.uint8)
    original = gray.copy()
    if mode == "A0_NONE":
        processed = original
        denoised = original
    elif mode == "A2_MORPHSAFE_V2":
        import cv2
        denoised = cv2.fastNlMeansDenoising(
            original, None, h=3, templateWindowSize=7, searchWindowSize=15
        )
        enhanced = cv2.createCLAHE(clipLimit=1.08, tileGridSize=(8, 8)).apply(denoised).astype(np.float32)
        # Match the original median and darken by only one grayscale level.
        enhanced += float(np.median(original)) - float(np.median(enhanced)) - 1.0
        enhanced = np.clip(enhanced, 0, 255).astype(np.uint8)
        processed = cv2.addWeighted(original, 0.30, enhanced, 0.70, 0)

        local_mean = cv2.blur(original.astype(np.float32), (5, 5))
        local_sq = cv2.blur(original.astype(np.float32) ** 2, (5, 5))
        local_std = np.sqrt(np.maximum(local_sq - local_mean ** 2, 0.0))
        border = np.concatenate([original[0], original[-1], original[:, 0], original[:, -1]])
        pad_level = float(np.median(border))
        flat_padding = (np.abs(original.astype(np.float32) - pad_level) <= 2.0) & (local_std < 0.8)
        processed[flat_padding] = original[flat_padding]
        # Never create new saturated black/white pixels.  Keeping the original
        # value here avoids losing thin cortical detail near the histogram ends.
        original_clipped = (original <= 1) | (original >= 254)
        processed_clipped = (processed <= 1) | (processed >= 254)
        processed[processed_clipped & ~original_clipped] = original[processed_clipped & ~original_clipped]
    else:
        raise ValueError(f"PREPROCESS_MODE ไม่รู้จัก: {mode}")

    import cv2
    delta = float(np.mean(np.abs(processed.astype(np.float32) - original.astype(np.float32))))
    mean_shift = float(processed.mean() - original.mean())
    original_clipped = (original <= 1) | (original >= 254)
    processed_clipped = (processed <= 1) | (processed >= 254)
    added_clip_fraction = float(np.mean(processed_clipped & ~original_clipped))
    edge0_map = cv2.Laplacian(original, cv2.CV_32F)
    edge1_map = cv2.Laplacian(processed, cv2.CV_32F)
    edge0 = float(edge0_map.var())
    edge1 = float(edge1_map.var())
    edge_ratio = edge1 / max(edge0, 1e-6)
    edge_correlation = float(np.corrcoef(edge0_map.ravel(), edge1_map.ravel())[0, 1]) if edge0 > 1e-6 else 1.0
    contrast_ratio = float(processed.std() / max(original.std(), 1e-6))
    denoise_delta = float(np.mean(np.abs(denoised.astype(np.float32) - original.astype(np.float32))))
    audit = {
        "mean_abs_delta": delta,
        "mean_intensity_shift": mean_shift,
        "added_clip_fraction": added_clip_fraction,
        "edge_ratio": edge_ratio,
        "edge_correlation": edge_correlation,
        "contrast_ratio": contrast_ratio,
        "denoise_delta": denoise_delta,
        "edge_variance_original": edge0,
    }
    edge_failed = edge0 > 20.0 and not (0.60 <= edge_ratio <= 2.80)
    structure_failed = edge0 > 20.0 and edge_correlation < 0.30
    gate_failed = delta > 18.0 or abs(mean_shift) > 8.0 or added_clip_fraction > 0.03 or edge_failed or structure_failed
    audit["status"] = "FALLBACK_ORIGINAL" if gate_failed else "PASS"
    audit["flag"] = "PREPROCESS_SAFETY_GATE" if gate_failed else "NONE"
    audit["review_reason"] = "unsafe_transform_replaced_with_original" if gate_failed else "morphology_safe_v2_gate_passed"
    if gate_failed:
        # A single unusual radiograph must not crash a long RunPod job.  The
        # safe action is to use its untouched ROI and record the fallback.
        processed = original.copy()
    output = Image.fromarray(processed, mode="L").convert("RGB")
    return (output, audit) if return_audit else output
