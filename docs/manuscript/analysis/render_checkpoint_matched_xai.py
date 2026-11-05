"""Render checkpoint-matched CAM figures without editing image intensity or CAM values.
Run with the project ML environment; optional --device cpu/cuda. No training.
"""
from pathlib import Path
import os,sys,json,hashlib,argparse
import numpy as np
import torch
from PIL import Image
import cv2
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import Normalize
from matplotlib.cm import ScalarMappable
ROOT=Path(__file__).resolve().parents[3];sys.path.insert(0,str(ROOT))
parser=argparse.ArgumentParser();parser.add_argument('--device',default='cpu');parser.add_argument('--evidence',type=Path,default=ROOT/'runtime/docs_prediction.json');args=parser.parse_args()
os.environ['BONEAGE_DEVICE']=args.device;torch.set_num_threads(4)
from model_service import SERVICE,prepare_roi,ROI_ORDER,resolve_checkpoint,model_entry
from cam_service import compute_cam
MODEL='full18_focalnet_feedback_candidate_20261007';EXPECTED='ed681f0355b5d1a3660cfa0a7e7d472884ef869d8b48c94348eff1257bd049e8'
evidence=json.loads(args.evidence.read_text(encoding='utf-8'));input_path=ROOT/'runtime/assets'/evidence['full_hand_url'].split('/runtime-assets/')[1]
checkpoint=resolve_checkpoint(model_entry(MODEL));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(checkpoint)==EXPECTED,'Checkpoint mismatch'
image=Image.open(input_path).convert('RGB');rgb=np.asarray(image)
boxes={d['roi']:d['box'] for d in evidence['detections']};roi_images=[];integer_boxes=[]
for roi in ROI_ORDER:
 x1,y1,x2,y2=[int(round(v)) for v in boxes[roi]];x1,y1=max(0,x1),max(0,y1);x2,y2=min(image.width,x2),min(image.height,y2);integer_boxes.append((x1,y1,x2,y2));roi_images.append(image.crop((x1,y1,x2,y2)))
inputs=torch.stack([prepare_roi(im,MODEL) for im in roi_images])[None].to(SERVICE.device);gender=torch.tensor([float(evidence['male'])],device=SERVICE.device)
model=SERVICE.get_model(MODEL);figdir=ROOT/'docs/manuscript/figures_xai';rawdir=ROOT/'runtime/xai_raw';figdir.mkdir(exist_ok=True);rawdir.mkdir(exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10})
manifest={'checkpoint_sha256':EXPECTED,'model_display_name':'FocalNet','model_id':MODEL,'input_image_sha256':sha(input_path),'input_filename':input_path.name,'illustrative_case':'RSNA demonstration','device':str(SERVICE.device),'sex_input':evidence['male'],'source_intensity_adjustment':'none','image_pixel_integrity':'original decoded RGB pixels; no contrast/sharpness/color retouch','crop_boxes':dict(zip(ROI_ORDER,integer_boxes)),'normalization':'min-max within each restored ROI; values not comparable across ROIs/methods','display':{'colormap':'turbo','alpha':'0.65 * normalized response','non_ROI_pixels':'unchanged','overlap_rule':'largest alpha wins'},'faithfulness_evaluated':False,'methods':{}}
restored={};overlays={}
for method in ['GradCAM','EigenCAM','LayerCAM-HR']:
 out,heat,meta=compute_cam(model,inputs,gender,method)
 pred=float(out['pred_months'].item());gates=out.get('roi_gate',out.get('gate'))
 rawfile=rawdir/(method+'_raw.npz');np.savez_compressed(rawfile,heat=heat)
 normalized=[];color=np.zeros_like(rgb,dtype=float);alpha=np.zeros(rgb.shape[:2],dtype=float)
 for hm,(x1,y1,x2,y2) in zip(heat,integer_boxes):
  w,h=x2-x1,y2-y1;scale=min(224/w,224/h);nw,nh=max(1,round(w*scale)),max(1,round(h*scale));px,py=(224-nw)//2,(224-nh)//2
  r=cv2.resize(hm[py:py+nh,px:px+nw],(w,h),interpolation=cv2.INTER_LINEAR)
  z=np.clip((r-r.min())/max(float(np.ptp(r)),1e-8),0,1);normalized.append(z)
  cmap=plt.get_cmap('turbo')(z)[...,:3];a=z*.65;dst=alpha[y1:y2,x1:x2];mask=a>dst;color[y1:y2,x1:x2][mask]=cmap[mask];dst[mask]=a[mask]
 full=rgb/255*(1-alpha[...,None])+color*alpha[...,None];overlays[method]=full;restored[method]=normalized
 manifest['methods'][method]={**meta,'predicted_months':pred,'raw_maps_sha256':sha(rawfile),'raw_maps_local_file':str(rawfile.relative_to(ROOT)),'restoration_interpolation':'bilinear after inverse aspect padding'}
 print(method,pred,meta['activation_shape'])
# Figure A: original, age-targeted GradCAM, and feature-based EigenCAM, all same checkpoint/input.
fig,ax=plt.subplots(1,3,figsize=(7.1,4.5),layout='constrained')
for a,label,im in zip(ax,['(a) Original radiograph','(b) Grad-CAM','(c) Eigen-CAM'],[rgb,overlays['GradCAM'],overlays['EigenCAM']]):
 a.imshow(im);a.set_title(label,fontsize=11);a.axis('off')
 for roi,(x1,y1,x2,y2) in zip(ROI_ORDER,integer_boxes):
  a.add_patch(plt.Rectangle((x1,y1),x2-x1,y2-y1,fill=False,color='#24dac7',lw=.55))
  # Names are shown at readable size in the separate ROI grid.
cb=fig.colorbar(ScalarMappable(norm=Normalize(0,1),cmap='turbo'),ax=ax[1:],shrink=.48,pad=.01);cb.set_label('Relative response within each ROI',fontsize=9)
fig.savefig(figdir/'Figure_XAI_full.png',dpi=350,bbox_inches='tight');fig.savefig(figdir/'Figure_XAI_full.pdf',bbox_inches='tight');plt.close(fig)
# Figure B: region crops with explicit method separation and no alterations to response strength.
fig,axes=plt.subplots(3,3,figsize=(8,8),layout='constrained')
for a,roi,im,z in zip(axes.flat,ROI_ORDER,roi_images,restored['GradCAM']):
 base=np.asarray(im)/255;ov=plt.get_cmap('turbo')(z)[...,:3];blend=base*(1-z[...,None]*.65)+ov*(z[...,None]*.65)
 a.imshow(blend);a.set_title('PP3MC' if roi=='PP3' else roi,fontsize=11);a.axis('off')
cb=fig.colorbar(ScalarMappable(norm=Normalize(0,1),cmap='turbo'),ax=list(axes.flat),shrink=.65,pad=.01);cb.set_label('Grad-CAM relative response within each ROI')
fig.savefig(figdir/'Figure_XAI_ROI9.png',dpi=350,bbox_inches='tight');fig.savefig(figdir/'Figure_XAI_ROI9.pdf',bbox_inches='tight');plt.close(fig)
# Supplementary full overlay, with no UI tint, for the higher-resolution method.
fig,ax=plt.subplots(figsize=(5,7));ax.imshow(overlays['LayerCAM-HR']);ax.axis('off');fig.tight_layout(pad=0);fig.savefig(figdir/'Supplement_LayerCAM.png',dpi=350,bbox_inches='tight');plt.close(fig)
(figdir/'XAI_figure_provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
