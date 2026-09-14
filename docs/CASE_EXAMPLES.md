# Curated XAI examples

## Selection rule

The figures in the repository README are taken only from a project export marked as a de-identified research example. A case is included only when all of the following are available in the export:

- a full hand radiograph and a 9-ROI detector mapping;
- a full-hand XAI view and an ROI-level XAI view generated from the same inference record;
- recorded true age, predicted age, absolute error and APE; and
- no patient name, date of birth, accession number, or other direct identifier embedded in the exported figure.

This is a presentation-selection rule, not an outcome-selection rule for model evaluation. Aggregate metrics must always be reported from the full pre-specified evaluation cohort.

## Case 7423 — low error

| Field | Recorded value |
| --- | --- |
| Model | EfficientNetV2-S (M06) |
| True bone age | 144.0 months (12 years) |
| Predicted bone age | 142.1 months |
| Signed error | -1.9 months |
| Absolute error | 1.9 months |
| APE | 1.3% |
| Detector mapping | 9/9 ROIs |

### What the figures show

- **GradCAM full-hand:** provides a spatial overview after the detector maps the nine anatomical regions. The strongest displayed activity is around the carpal and selected central phalangeal regions; it should be interpreted together with the cyan ROI boxes rather than as a standalone segmentation.
- **LayerCAM-HR ROI panel:** shows a higher-detail view of the mapped crops. Activity appears in carpal structures and selected epiphyseal/growth-plate regions, which are anatomically plausible locations to inspect in skeletal-age assessment.

### Interpretation limits

CAM images are explanations of model sensitivity under a specific method and display normalisation. They do **not** prove that the model used only these structures, do not establish clinical causality, and do not replace blinded expert review or formal faithfulness testing. A low-error case is included here to demonstrate output readability; it must not be used to imply that every case has the same quality of explanation.

## Case 6543 — moderate error

| Field | Recorded value |
| --- | --- |
| Model | EfficientNetV2-S (M06) |
| True bone age | 69.0 months (6 years) |
| Predicted bone age | 73.5 months |
| Signed error | +4.5 months |
| Absolute error | 4.5 months |
| APE | 6.5% |
| Detector mapping | 9/9 ROIs |

This case shows that all anatomical regions can be detected and the XAI crops can appear anatomically plausible while the numerical prediction still differs from the reference age. It should therefore be used to explain the review workflow rather than as an example of model success alone.

## Case 10320 — high error

| Field | Recorded value |
| --- | --- |
| Model | EfficientNetV2-S (M06) |
| True bone age | 120.0 months (10 years) |
| Predicted bone age | 94.8 months |
| Signed error | -25.2 months |
| Absolute error | 25.2 months |
| APE | 21.0% |
| Detector mapping | 9/9 ROIs |

This deliberately retained failure case makes an important point: a detector can map all nine ROIs while the regressor still produces a large error. The visualisations provide a trace for expert review; they do not validate a prediction or compensate for an incorrect estimate.
