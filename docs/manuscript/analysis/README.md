# Reproduce the FocalNet analysis

Run from the repository root after installing numpy, pandas and matplotlib:

```powershell
python docs/manuscript/analysis/run_focalnet_analysis.py --predictions "D:\path\to\archived_predictions.csv"
```

The default input points to the author's archived file. Raw case-level predictions and radiographs are not bundled. Required columns are model_id, scenario, status, patient_id, checkpoint_sha256, reference_months, predicted_months, and male. The script selects only the author-approved checkpoint and original_roi_protocol, checks one row per patient, and rejects a mismatched checkpoint hash. It performs no training and does not modify predictions.

Outputs are FocalNet_metrics.csv, FocalNet_subgroups.csv, FocalNet_provenance.json and the figures directory. Bootstrap uses 20,000 patient resamples and seed 20261105. Age strata use reference bone age rather than chronological age. Limits of agreement are descriptive; no clinical acceptability limits were prespecified. The original PDF's MAE confidence interval differs from this reproducible recalculation and is documented in the change log.

To rebuild the revised Word manuscript after generating the analysis outputs:

```powershell
python docs/manuscript/analysis/build_reviewed_manuscript.py
```

This needs python-docx, pandas, the reference-audit JSON and the author-supplied loupe image at docs/assets/web-loupe.png. PDF conversion requires Word or a compatible document renderer. A successful build does not resolve the pending ethics declaration, patient-level data-lineage audit, or author approval.


## Revised XAI manuscript
`build_xai_web_manuscript.py` builds the revised document from the verified metrics and audited references. `build_workflow_figure.py` draws a single-model workflow. `render_checkpoint_matched_xai.py` requires the locally retained demonstration evidence `runtime/docs_prediction.json`, its image and matching checkpoint; these restricted runtime inputs are not bundled in Git. Raw map hashes and rendering settings are retained in `figures_xai/XAI_figure_provenance.json`. The figure generation is inference only and does not train the model. The full PDF-to-revision section comparison is `Full_section_comparison.csv`.
