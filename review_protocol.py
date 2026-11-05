"""Research feedback eligibility. Unknown provenance is deliberately not training-ready."""
import csv
import os
from pathlib import Path


def protected_patient_ids():
    manifest_dir = os.getenv('BONEAGE_MANIFEST_DIR')
    root = Path(manifest_dir) if manifest_dir else Path(__file__).resolve().parent / 'manifests'
    ids = set()
    complete = True
    for name in ('FULL18_VALIDATION_REAL_260.csv', 'FULL18_LOCKED_TEST_REAL_260.csv'):
        path = root / name
        if not path.is_file():
            complete = False
            continue
        with path.open(encoding='utf-8-sig', newline='') as handle:
            for row in csv.DictReader(handle):
                for field in ('patient_id', 'source_patient_id'):
                    if row.get(field):
                        ids.add(row[field].strip())
    return ids, complete


def eligibility_reasons(payload):
    reasons = []
    if payload.get('locked_test') or payload.get('split') in ('validation', 'val', 'test', 'locked_test'):
        reasons.append('protected validation/test case')
    if not payload.get('inference_id'):
        reasons.append('missing immutable inference record')
    if payload.get('review_status') not in ('reviewed', 'accepted'):
        reasons.append('review is draft or rejected')
    checks = payload.get('curation_checks', {})
    for field in ('provenance_approved', 'anatomy_qc_approved', 'consent_approved', 'split_clearance_approved'):
        if checks.get(field) is not True:
            reasons.append(field)
    if not payload.get('curation_evidence', '').strip():
        reasons.append('missing curation evidence')
    return reasons
