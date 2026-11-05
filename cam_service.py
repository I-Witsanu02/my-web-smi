"""CAMs targeting the frozen multi-ROI regression output, not a surrogate classifier.

Formula references: github.com/jacobgil/pytorch-grad-cam (GradCAM++, LayerCAM,
ScoreCAM); GradCAM arXiv:1610.02391; EigenCAM arXiv:2008.00299.
ScoreCAM is explicitly a top-K regression adaptation unless topk=0.
"""
from __future__ import annotations
import time
import numpy as np
import torch
import torch.nn.functional as F

METHODS = ('GradCAM','GradCAM++','ScoreCAM','EigenCAM','LayerCAM-HR')
VERSION = 'roi9-cam-regression-v1'


def spatial(tensor):
    if tensor.ndim != 4 or tensor.shape[0] != 9:
        raise ValueError(f'CAM requires 9 spatial activations, got {tuple(tensor.shape)}')
    # timm Swin / ConvNeXt LayerNorm use NHWC; FocalNet / EfficientNet use NCHW.
    return tensor.permute(0,3,1,2) if tensor.shape[1]==tensor.shape[2] and tensor.shape[-1]>tensor.shape[1] else tensor


def target_module(model, method):
    backbone = getattr(model,'backbone_name','focalnet_tiny_srf')
    high = method=='LayerCAM-HR'
    if 'swin' in backbone or 'focalnet' in backbone:
        name='layers.2.blocks.5.norm1' if high else 'layers.3.blocks.1.norm1'
    elif 'convnext' in backbone:
        name='stages.2.blocks.8.norm' if high else 'stages.3.blocks.2.norm'
    elif 'efficientnet' in backbone:
        name='blocks.3' if high else 'conv_head'
    else:
        raise ValueError(f'No audited CAM target for {backbone}')
    return name, model.backbone.get_submodule(name)


def compute_cam(model, rois, gender, method, topk=16):
    if method not in METHODS: raise ValueError(f'Unsupported XAI method: {method}')
    started=time.perf_counter(); name,layer=target_module(model,method); captured={}
    hook=layer.register_forward_hook(lambda _module,_inputs,out: captured.update(activation=out))
    try:
        with torch.enable_grad():
            x=rois.detach().requires_grad_(True)
            output=model(x,gender)
            raw=captured['activation']; act=spatial(raw)
            if act.shape[-1]<2 or act.shape[-2]<2: raise ValueError('Target layer has no usable spatial map')
            if method in ('GradCAM','GradCAM++','LayerCAM-HR'):
                gradient=spatial(torch.autograd.grad(output['pred_months'].sum(),raw)[0])
            act=act.detach().float()
            if method=='GradCAM':
                maps=(gradient.mean((2,3),keepdim=True)*act).sum(1).relu()
            elif method=='GradCAM++':
                g=gradient.detach().float(); g2,g3=g.square(),g.pow(3)
                # Common first-gradient-power implementation, not exact higher derivatives
                # of a nonlinear regression network. Record the approximation explicitly.
                denominator=2*g2+act.sum((2,3),keepdim=True)*g3
                alpha=torch.where(g!=0,g2/(denominator+1e-6),torch.zeros_like(g2))
                weights=(alpha*g.relu()).sum((2,3),keepdim=True)
                maps=(weights*act).sum(1).relu()
            elif method=='LayerCAM-HR':
                maps=(gradient.detach().relu()*act).sum(1).relu()
            elif method=='EigenCAM':
                values=[]
                for a in act.cpu():
                    matrix=a.flatten(1).T; matrix=matrix-matrix.mean(0,keepdim=True)
                    _u,_s,vh=torch.linalg.svd(matrix,full_matrices=False)
                    projected=matrix@vh[0]
                    # Resolve SVD sign ambiguity deterministically; never use abs or fallback
                    # to a different explanation method when decomposition fails.
                    if projected[projected.abs().argmax()]<0: projected=-projected
                    values.append(projected.reshape(a.shape[-2:]).relu())
                maps=torch.stack(values)
            else:
                hook.remove(); captured.clear()
                output={key:value.detach() if isinstance(value,torch.Tensor) else value for key,value in output.items()}
                del raw,x
                maps=[]
                with torch.no_grad():
                    for roi_index,a in enumerate(act):
                        channels=a.shape[0]; k=channels if topk==0 else min(topk,channels)
                        indices=a.relu().mean((1,2)).topk(k).indices
                        selected=a[indices]; masks=F.interpolate(selected[:,None],size=rois.shape[-2:],mode='bilinear',align_corners=False)[:,0]
                        low=masks.amin((1,2),keepdim=True); high=masks.amax((1,2),keepdim=True)
                        valid=(high-low).flatten()>1e-8
                        selected=selected[valid]; masks=((masks-low)/(high-low+1e-8))[valid]
                        if not len(masks): maps.append(torch.zeros(a.shape[-2:],device=a.device));continue
                        scores=[]
                        for start in range(0,len(masks)):
                            mask=masks[start:start+1]; inputs=rois.detach().repeat(len(mask),1,1,1,1)
                            # Other eight ROI inputs and sex are kept unchanged.
                            # Zero is the ImageNet mean in normalized input coordinates.
                            inputs[:,roi_index]=inputs[:,roi_index]*mask[:,None]
                            scores.append(model(inputs,gender.repeat(len(mask)))['pred_months'].float())
                        weights=torch.cat(scores).softmax(0)
                        maps.append((weights[:,None,None]*selected).sum(0).relu())
                maps=torch.stack(maps)
            if not torch.isfinite(maps).all(): raise ValueError('Non-finite CAM; result not released')
            heat=F.interpolate(maps[:,None].float(),size=rois.shape[-2:],mode='bilinear',align_corners=False)[:,0].detach().cpu().numpy()
            metadata={'version':VERSION,'method':method,'target':'pred_months (increasing age)' if method!='EigenCAM' else 'feature principal component (not age-targeted)',
                'target_layer':f'backbone.{name}','activation_shape':list(act.shape),'elapsed_seconds':round(time.perf_counter()-started,3),
                'scorecam_topk':topk if method=='ScoreCAM' else None,'scorecam_full_channels':method=='ScoreCAM' and topk==0,
                'gradcampp_variant':'first-gradient-power approximation for regression' if method=='GradCAM++' else None,
                'baseline':'zero = ImageNet mean in normalized input','gate_weighted_display':False,'faithfulness_validated':False,
                'flat_rois':[i for i,m in enumerate(heat) if float(np.ptp(m))<1e-8]}
            return output,heat,metadata
    finally:
        hook.remove();captured.clear();model.zero_grad(set_to_none=True)
