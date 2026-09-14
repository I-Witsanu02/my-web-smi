"""Evaluate every fixed validation row, retaining errors; never reads locked test."""
import argparse
import csv
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from model_service import SERVICE, ROI_ORDER, model_entry, resolve_checkpoint


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--package', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    manifest = args.package / 'manifests/FULL18_VALIDATION_REAL_260.csv'
    with manifest.open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    ids = [r['source_patient_id'] for r in rows]
    if len(ids) != len(set(ids)) or any(r['split'] != 'val' or int(r['is_aug']) != 0 for r in rows):
        raise ValueError('Validation must contain unique real patients only')
    model_id = 'full18_focalnet_b8'
    results = []
    args.output.mkdir(parents=True, exist_ok=True)
    for index, row in enumerate(rows):
        record = {'patient_id': row['source_patient_id'], 'true_months': float(row['boneage']),
                  'male': int(row['male']), 'age_bin': row['age_years']}
        try:
            images = {}
            for roi in ROI_ORDER:
                with Image.open(args.package / row['roi_' + roi]) as im:
                    images[roi] = im.convert('RGB')
            pred = SERVICE.predict_roi_images(images, record['male'], model_id)
            record.update(predicted_months=pred['predicted_months'], status='ok')
            record['signed_error_months'] = pred['predicted_months'] - record['true_months']
        except Exception as exc:
            record.update(status='failed', error=str(exc))
        results.append(record)
        if (index + 1) % 20 == 0:
            print(f'{index + 1}/{len(rows)} evaluated', flush=True)
    successful = [r for r in results if r['status'] == 'ok']
    def metrics(group):
        err = np.array([r['signed_error_months'] for r in group])
        return {'n': len(group), 'mae_months': float(np.abs(err).mean()),
                'rmse_months': float(np.sqrt((err ** 2).mean())), 'bias_months': float(err.mean())} if len(group) else {'n': 0}
    report = {'model_id': model_id, 'checkpoint_sha256': hashlib.sha256(resolve_checkpoint(model_entry(model_id)).read_bytes()).hexdigest(),
              'manifest_sha256': hashlib.sha256(manifest.read_bytes()).hexdigest(),
              'attempted': len(rows), 'failed': len(rows) - len(successful),
              'protocol': 'reviewed cached ROI validation; NOT detector end-to-end',
              'locked_test_run': False, 'overall': metrics(successful),
              'by_sex': {str(s): metrics([r for r in successful if r['male'] == s]) for s in [0, 1]},
              'by_age_bin': {a: metrics([r for r in successful if r['age_bin'] == a]) for a in sorted(set(r['age_bin'] for r in results), key=int)},
              'cases': results}
    (args.output / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k != 'cases'}, indent=2), flush=True)
    if report['failed']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
