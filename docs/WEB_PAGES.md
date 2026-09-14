# Web application screen guide

The live interface is available at [Skeleton Bone Age on Vercel](https://web-livid-six-41.vercel.app). It is designed as a research-review workflow and requires an authorised account for image assessment.

| Screen | What it displays | Intended use |
| --- | --- | --- |
| Login | Research-use warning, language control and account sign-in | Protects the assessment workflow from anonymous upload. |
| Overview | Recent case context, high-level status and workflow entry points | Orientates an authorised reviewer. |
| New assessment | Case metadata and de-identified image selection | Starts a new research assessment. |
| ROI quality control | Full hand image, mapped 9 ROIs and quality gate | Lets the reviewer confirm localisation before relying on a result. |
| Prediction | True/reference fields where available, predicted bone age, error fields and model label | Separates raw model output from the subsequent review decision. |
| XAI | Full-hand evidence image and ROI-level CAM panels | Supports inspection of model-sensitive image regions. |
| Report | Structured summary for the case and reviewer note | Records the research-review outcome. |
| Audit | Case history and traceable review actions | Supports retrospective quality review. |

## What each result page must show

For a reproducible interpretation, the result and XAI screens should retain these fields together:

1. Model identifier and checkpoint/version.
2. True age/reference age when it is legitimately available for evaluation.
3. Predicted age in months and years/months.
4. Signed error, absolute error and APE for evaluation cases.
5. ROI detection status, including the mapped-count out of nine.
6. The XAI method and whether the image is a full-hand or crop-level view.

The curated examples in [CASE_EXAMPLES.md](CASE_EXAMPLES.md) show how these fields are reported for low-, moderate-, and high-error cases.
