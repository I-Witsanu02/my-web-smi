# Prompt for IDE: Explainable Bone Age Assessment System

Use this prompt in Cursor / Windsurf / GitHub Copilot.

Build a Next.js App Router + TypeScript + Tailwind CSS prototype for an “Explainable Bone Age Assessment System”.

Project context:
- Research prototype for pediatric growth screening and bone age assessment.
- Clinical decision-support only, not automatic diagnosis.
- Use mock/demo data first.
- Do not train a model.
- Do not connect real backend inference yet.

Main workflow:
1. Login + clinical consent
2. Pre-X-ray Growth Screening
3. New Case / Patient Intake
4. X-ray Upload + Image Quality Check
5. Multi-ROI Detection
6. Prediction Result
7. Explainable AI Comparison
8. Report + History

Routes:
- /login
- /screening
- /cases
- /cases/new
- /cases/[id]/upload
- /cases/[id]/roi
- /cases/[id]/result
- /cases/[id]/xai
- /cases/[id]/report
- /admin/models
- /audit

Design style:
- Clean medical dashboard
- Navy blue, teal, white, light gray
- Rounded cards
- Thai UI with optional English subtitles
- Desktop-first, responsive for tablet

Required components:
- AppShell
- Sidebar
- Topbar
- Stepper
- ClinicalDisclaimerBanner
- ConsentCard
- PatientSummaryCard
- GrowthScreeningForm
- GrowthMetricCard
- RiskBadge
- XrayUploadDropzone
- ImageQualityCheckCard
- XrayViewer
- RoiOverlayViewer
- RoiCropGrid
- PredictionSummaryCards
- BoneAgeComparisonChart
- UncertaintyCard
- XaiHeatmapGrid
- RoiImportanceChart
- XaiMethodComparisonTable
- ReportPreview
- AuditLogTable
- ModelVersionBadge

Clinical disclaimer:
Show this on every clinical output page:
“Clinical decision support only. Not a medical diagnosis.”
Thai:
“ระบบนี้ใช้เพื่อสนับสนุนการพิจารณาทางคลินิก ไม่ใช่การวินิจฉัยแทนแพทย์”

Mock case:
- Case ID: BA-DEMO-10226
- Chronological Age: 13y 10m
- Predicted Bone Age: 16y 8m / 200 months
- BA-CA Difference: +34 months
- Uncertainty: ±6.3 months
- Model: FocalNet-Tiny v6.2
- Interpretation: Clinical review suggested

XAI page:
- Show Grad-CAM
- Grad-CAM++
- Score-CAM
- Eigen-CAM
- ROI importance chart
- XAI comparison table: method, ROI overlap, heatmap area, entropy, processing time
- Warning: “Heatmaps help inspect model behavior but do not prove that the model reasons like a physician.”

Storage design:
- PostgreSQL for structured data
- S3/MinIO for X-ray images, ROI crops, heatmaps, PDF reports
- Audit logs for all user actions
- Anonymized Case ID
- Role-based access control

Do not overclaim medical capability. Use wording:
“screening”, “review suggested”, “clinical decision support”, “not a diagnosis”.
