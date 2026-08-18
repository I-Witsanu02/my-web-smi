# BoneAge reproducibility artifacts

This folder contains the smallest checked-in set needed to reproduce the audited
YOLO11s detector setup and follow the local run workflow. It intentionally does
not contain the RSNA full dataset, patient-level manifests, caches, credentials,
RunPod outputs, or completed training runs.

## Artifact manifest

| File | Source / provenance | License / status | SHA256 | Purpose |
|---|---|---|---|---|
| `BoneAge_LOCAL4050_V1_R3_AUDITED_20260817.ipynb` | Local working artifact supplied in the project Downloads folder | Project research artifact; no redistribution license asserted | `F37C2BD75FE4AD5C466A1BCE2A2B556182CB6F1BA0EE02FE8EEDC951604783E4` | Audited clean split-lock, detector, ROI proposal and QC workflow |
| `BoneAge_LOCAL4050_V1_RUN_GUIDE.txt` | Local working artifact supplied in the project Downloads folder | Project research artifact; no redistribution license asserted | `28F87406351169FFAE5199C8E40612F6AEF77E4E1B059744F5CE9D820B92EC96` | Runtime and execution instructions |
| `yolo11s.pt` | Ultralytics generic YOLO11s checkpoint copied from local Downloads | Ultralytics model asset; verify applicable Ultralytics license before redistribution | `85A76FE86DD8AFE384648546B56A7A78580C7CB7B404FC595F97969322D502D5` | Generic initialization checkpoint; not a trained patient-data model |

## RSNA sample images

The repository already contains two small local demo radiograph files under
`public/demo/bone-age/xrays/`. They remain demo assets only; their exact RSNA
record identifiers and redistribution provenance were not available in the
local workspace, so no new claim is made here that they are an official RSNA
redistribution. The full RSNA dataset must be obtained from its official source
under its terms and is deliberately excluded from Git.

## Important limitation

The specifically named `BoneAge_LOCAL4050_V1_DEVELOPED_FIXED.ipynb` was not
present locally. The uploaded notebook is the available audited R3 artifact and
is not represented as that missing file.
