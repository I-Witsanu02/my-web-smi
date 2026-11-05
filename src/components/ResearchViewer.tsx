import React, { useEffect, useRef, useState } from 'react';
import { AuthenticatedImage } from './AuthenticatedImage';
import { DetectedROI } from '../types';
import { imagePoint } from '../utils/roiGeometry';
import { useAdjustedImage } from '../utils/useAdjustedImage';
import { detectorImage } from '../utils/detectorImage';

export interface ViewSettings { localEnabled?:boolean; rotation: number; zoom: number; x: number; y: number; brightness: number; contrast: number; sharpness: number; opacity: number; gamma?: number; blue?: boolean; window?:number; level?:number; localStrength?:number; palette?:'original'|'gray'|'blue' }
export const DEFAULT_VIEW: ViewSettings = { rotation: 0, zoom: 1, x: 0, y: 0, brightness: 100, contrast: 100, sharpness: 0, opacity: 70, gamma: 1, blue: false, window:255,level:127.5,localStrength:.2 };
interface Props { onAdjustedImage?:(source:string,url:string)=>void; processing?:boolean; onDetectorRetry?:(file:File,settings:ViewSettings)=>Promise<void>; source: string; overlay?: string; rois: DetectedROI[]; caseKey: string; onSettings?: (value: ViewSettings) => void; onRoisChange?: (rois: DetectedROI[]) => void; selectedRoi?:string; onSelectRoi?:(id:string)=>void; stale?:boolean }

export function ResearchViewer({ onAdjustedImage, processing, onDetectorRetry, source, overlay, rois, caseKey, onSettings, onRoisChange, selectedRoi, onSelectRoi, stale }: Props) {
  const [view, setView] = useState<ViewSettings>(DEFAULT_VIEW);
  const originalImage=useRef<HTMLImageElement|null>(null);
  const adjusted=useAdjustedImage(source,view);
  useEffect(()=>{originalImage.current=adjusted.image;},[adjusted.image]);
  useEffect(()=>{onAdjustedImage?.(source,adjusted.url);},[source,adjusted.url,onAdjustedImage]);
  const [enhancementError,setEnhancementError]=useState('');
  useEffect(()=>{setEnhancementError('');setLens(null);setTool('pan');},[caseKey,source]);
  const applyLocal=()=>setView(v=>({...v,localEnabled:true}));
  const [tool, setTool] = useState<'pan'|'rotate'|'draw'|'select'|'loupe'|'none'>('pan');
  const [draft, setDraft] = useState<DetectedROI[] | null>(null);
  const [lens, setLens] = useState<{x:number;y:number} | null>(null);
  const [loupeZoom,setLoupeZoom]=useState(1);
  const edit = useRef<{element:HTMLElement; x:number;y:number; mode:'draw'|'move'|'resize'; roi:DetectedROI} | null>(null);
  const draftRef = useRef<DetectedROI[] | null>(null);
  const [compare, setCompare] = useState(false);
  const [boxes, setBoxes] = useState(true);
  const [xai, setXai] = useState(true);
  const [dimensions, setDimensions] = useState({ w: 1, h: 1 });
  const [selected, setSelected] = useState('');
  useEffect(()=>{if(selectedRoi!==undefined)setSelected(selectedRoi);},[selectedRoi]);
  const drag = useRef<{ x: number; y: number; rotation: number; angle: number; cx: number; cy: number; startX: number; startY: number } | null>(null);
  useEffect(() => { let restored=DEFAULT_VIEW; try { restored={...DEFAULT_VIEW,...JSON.parse(localStorage.getItem(`boneage-view:${caseKey}:${source}`)||'{}')}; } catch {} setView(restored); setSelected(''); setDraft(null); draftRef.current=null; edit.current=null; }, [caseKey, source]);
  useEffect(() => { const timer=window.setTimeout(()=>{try {localStorage.setItem(`boneage-view:${caseKey}:${source}`,JSON.stringify(view));}catch{}},300); return ()=>clearTimeout(timer); },[view,caseKey,source]);
  const notifiedKey=useRef('');
  useEffect(() => { const key=caseKey+source;if(notifiedKey.current!==key){notifiedKey.current=key;return;}onSettings?.(view); }, [view, onSettings,caseKey,source]);
  const update = (key: keyof ViewSettings, value: number) => setView(v => ({ ...v, [key]: value }));
  const zoom = (delta: number) => setView(v => ({ ...v, zoom: Math.max(0.3, Math.min(5, v.zoom + delta)) }));
  const focusRoi=(roi:DetectedROI)=>{const element=document.querySelector<HTMLElement>('.research-canvas .image-transform');if(!element)return;const panel=element.parentElement!;const w=element.offsetWidth,h=element.offsetHeight;const cx=(parseFloat(roi.bbox.left)+parseFloat(roi.bbox.width)/2-50)*w/100,cy=(parseFloat(roi.bbox.top)+parseFloat(roi.bbox.height)/2-50)*h/100;const angle=view.rotation*Math.PI/180;const z=Math.max(1,Math.min(5,Math.min(panel.clientWidth/(parseFloat(roi.bbox.width)*w/100+80),panel.clientHeight/(parseFloat(roi.bbox.height)*h/100+80))));setView(v=>({...v,zoom:z,x:-(cx*Math.cos(angle)-cy*Math.sin(angle))*z,y:-(cx*Math.sin(angle)+cy*Math.cos(angle))*z}));};
  // Inverse display transform. offsetWidth/Height exclude CSS pan, rotation and scale.
  useEffect(()=>{if(tool==='pan'){const roi=rois.find(r=>r.id===selected);if(roi&&parseFloat(roi.bbox.width)>0)focusRoi(roi);}},[selected]);
  const nativePoint=(element:HTMLElement,x:number,y:number)=>{const rect=element.getBoundingClientRect();const p=imagePoint(x,y,rect.left+rect.width/2,rect.top+rect.height/2,element.offsetWidth,element.offsetHeight,view.zoom,view.rotation);return {x:Math.max(0,Math.min(100,p.x)),y:Math.max(0,Math.min(100,p.y))};};
  const beginEdit=(e:React.PointerEvent,element:HTMLElement,roi:DetectedROI,mode:'draw'|'move'|'resize')=>{e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);const p=nativePoint(element,e.clientX,e.clientY);setSelected(roi.id);onSelectRoi?.(roi.id);edit.current={element,...p,mode,roi};};
  const moveEdit=(e:React.PointerEvent)=>{const d=edit.current;if(!d)return;const p=nativePoint(d.element,e.clientX,e.clientY);let left=parseFloat(d.roi.bbox.left),top=parseFloat(d.roi.bbox.top),width=parseFloat(d.roi.bbox.width),height=parseFloat(d.roi.bbox.height);if(d.mode==='draw'){left=Math.min(d.x,p.x);top=Math.min(d.y,p.y);width=Math.abs(p.x-d.x);height=Math.abs(p.y-d.y);}else if(d.mode==='move'){left=Math.max(0,Math.min(100-width,left+p.x-d.x));top=Math.max(0,Math.min(100-height,top+p.y-d.y));}else{width=Math.max(.1,Math.min(100-left,width+p.x-d.x));height=Math.max(.1,Math.min(100-top,height+p.y-d.y));}const next=rois.map(r=>r.id===d.roi.id?{...r,bbox:{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`},status:'flagged' as const,source:'expert_review' as const,reviewState:'EDITED' as const}:r);draftRef.current=next;setDraft(next);};
  const endEdit=()=>{if(edit.current&&draftRef.current){const r=draftRef.current.find(r=>r.id===edit.current?.roi.id);if(r&&parseFloat(r.bbox.width)>.1&&parseFloat(r.bbox.height)>.1)onRoisChange?.(draftRef.current);}edit.current=null;draftRef.current=null;setDraft(null);};
  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!source || tool==='draw' || tool==='select' || tool==='loupe' || tool==='none') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + view.x, cy = rect.top + rect.height / 2 + view.y;
    drag.current = { x: e.clientX, y: e.clientY, rotation: view.rotation, angle: Math.atan2(e.clientY - cy, e.clientX - cx), cx, cy, startX: view.x, startY: view.y };
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (tool === 'pan') setView(v => ({ ...v, x: d.startX + e.clientX - d.x, y: d.startY + e.clientY - d.y }));
    else if(tool==='rotate') {
      const angle = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
      const delta = Math.atan2(Math.sin(angle - d.angle), Math.cos(angle - d.angle));
      setView(v => ({ ...v, rotation: Math.round((d.rotation + delta * 180 / Math.PI) * 10) / 10 }));
    }
  };
  const panel = (showOverlay: boolean, label: string) => <div className="research-canvas" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} style={{ cursor: tool === 'rotate' || tool === 'draw' ? 'crosshair' : 'grab' }}>
    <span className="canvas-label">{label}</span>
    {!source ? <div className="viewer-empty"><span className="material-symbols-outlined">radiology</span><strong>Select a hand radiograph</strong><p>Original imageและคำอธิบายจะอยู่ในเคสเดียวกัน</p></div> :
      <div className="image-transform" data-testid="image-transform" onPointerDown={e=>{if(tool==='draw'&&onRoisChange){const roi=rois.find(r=>r.id===selected);if(roi)beginEdit(e,e.currentTarget,roi,'draw');}}} onPointerMove={e=>{moveEdit(e);if(tool==='loupe')setLens(nativePoint(e.currentTarget,e.clientX,e.clientY));}} onPointerUp={endEdit} onPointerCancel={()=>{edit.current=null;draftRef.current=null;setDraft(null);}} onPointerLeave={()=>setLens(null)} style={{ width: `min(94cqw, ${88 * dimensions.w / dimensions.h}cqh)`, height: 'auto', aspectRatio: `${dimensions.w}/${dimensions.h}`, transform: `translate(${view.x}px, ${view.y}px) rotate(${view.rotation}deg) scale(${view.zoom})` }}>
        <AuthenticatedImage src={showOverlay?(adjusted.url||source):source} alt={showOverlay?'Display image — model input is unchanged':'Original radiograph'} draggable={false} onLoad={e => {setDimensions({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });}} />
        {showOverlay&&view.blue&&overlay&&xai&&<div className="blue-view-tint" aria-label="Blue display tint; not attribution" />}
        {showOverlay && overlay && xai && <AuthenticatedImage className="viewer-overlay" src={overlay} alt="XAI for this image" draggable={false} style={{ opacity: view.opacity / 100 }} />}
        {tool==='loupe'&&lens&&<div className="native-loupe" style={{transformOrigin:'0 0',left:`${lens.x}%`,top:`${lens.y}%`,transform:`rotate(${-view.rotation}deg) scale(${1/view.zoom}) translate(-50%,-50%)`}}><AuthenticatedImage src={showOverlay?(adjusted.url||source):source} alt={showOverlay?"Loupe of current image":"Loupe of original image"} style={{position:'absolute',width:dimensions.w*loupeZoom,height:dimensions.h*loupeZoom,maxWidth:'none',left:90-lens.x*dimensions.w*loupeZoom/100,top:90-lens.y*dimensions.h*loupeZoom/100}} /></div>}
        {boxes && (draft||rois).filter(r => r.status !== 'pending' && r.reviewState!=='OUT_OF_FIELD'&&r.reviewState!=='NOT_VISIBLE'&&parseFloat(r.bbox.width) > 0).map(r => <button key={r.id} className={`viewer-roi ${selected === r.id ? 'selected' : ''}`} style={{ ...r.bbox, position: 'absolute' }} onPointerDown={e => {if(tool==='select'&&onRoisChange)beginEdit(e,e.currentTarget.parentElement!,r,'move');else if(tool==='draw'&&onRoisChange){const target=rois.find(item=>item.id===selected);if(target)beginEdit(e,e.currentTarget.parentElement!,target,'draw');}else if(tool!=='pan'&&tool!=='rotate')e.stopPropagation();}} onClick={() => {setSelected(r.id);onSelectRoi?.(r.id);}} onKeyDown={e=>{if(!onRoisChange||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=(e.shiftKey?5:1)*100/(e.key.includes('Left')||e.key.includes('Right')?dimensions.w:dimensions.h);const left=Math.max(0,Math.min(100-parseFloat(r.bbox.width),parseFloat(r.bbox.left)+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0)));const top=Math.max(0,Math.min(100-parseFloat(r.bbox.height),parseFloat(r.bbox.top)+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)));onRoisChange(rois.map(item=>item.id===r.id?{...r,bbox:{...r.bbox,left:`${left}%`,top:`${top}%`},source:'expert_review',status:'flagged',reviewState:'EDITED'}:item));}} title={`${r.code}: box in original image coordinates`}><span>{r.code==='PP3'?'PP3MC':r.code}</span>{selected===r.id&&tool==='select'&&<i className="roi-resize-handle" onPointerDown={e=>beginEdit(e,e.currentTarget.parentElement!.parentElement!,r,'resize')} />}</button>)}
      </div>}
    <span className="canvas-position">{view.rotation.toFixed(1)}° · {Math.round(view.zoom * 100)}%</span>
  </div>;
  return <section className="research-viewer" aria-label="Image viewer">
    <div className="viewer-toolbar">
      {onDetectorRetry&&<button disabled={processing||!source} onClick={async()=>{try{const img=originalImage.current;if(!img)throw new Error('Wait for the image to load');await onDetectorRetry(await detectorImage(img,view),view);setEnhancementError('');}catch(e){setEnhancementError(e instanceof Error?e.message:'Redetection failed');}}}>Run detection again on the adjusted image</button>}
      {onRoisChange&&<><button aria-pressed={tool==='select'} onClick={()=>setTool(tool==='select'?'none':'select')}>Select / move / resize</button><select aria-label="Select an ROI to draw" value={selected} onChange={e=>{setSelected(e.target.value);onSelectRoi?.(e.target.value);}}><option value="">Select ROI</option>{rois.map(r=><option key={r.id} value={r.id}>{r.code==='PP3'?'PP3MC':r.code}</option>)}</select><button disabled={!rois.length} aria-pressed={tool==='draw'} onClick={()=>{if(tool==='draw'){setTool('none');return;}const target=selected||rois.find(r=>parseFloat(r.bbox.width)<=0)?.id||rois[0]?.id;if(target){setSelected(target);onSelectRoi?.(target);}setTool('draw');}}>Draw a new box</button></>}
      <button aria-pressed={tool==='loupe'} onClick={()=>{setTool(tool==='loupe'?'none':'loupe');setLens(tool==='loupe'?null:{x:50,y:50});}}>🔍 Point loupe</button>
      <label style={{color:'white',fontSize:12}}>Loupe {loupeZoom.toFixed(1)}× <input aria-label="Loupe magnification" type="range" min="0.25" max="3" step="0.25" value={loupeZoom} onChange={e=>setLoupeZoom(Number(e.target.value))}/></label>
      <button disabled={!rois.find(r=>r.id===selected&&parseFloat(r.bbox.width)>0)} onClick={()=>{const roi=rois.find(r=>r.id===selected);if(roi)focusRoi(roi);}}>Enlarge selected ROI</button>
      <button onClick={()=>setView(v=>({...v,x:0,y:0,zoom:1}))}>Fit</button>
      {[0,90,180,270].map(angle=><button key={angle} onClick={()=>update('rotation',angle)}>{angle}°</button>)}
      <button disabled={!overlay} aria-pressed={Boolean(view.blue)} onClick={()=>setView(v=>({...v,blue:!v.blue}))}>XAI background: {view.blue?'Blue':'No tint'} · Original heatmap colors</button>
      <button aria-pressed={tool === 'pan'} onClick={() => setTool(tool==='pan'?'none':'pan')}><span className="material-symbols-outlined">pan_tool</span>Pan</button>
      <button aria-pressed={tool === 'rotate'} onClick={() => setTool(tool==='rotate'?'none':'rotate')}><span className="material-symbols-outlined">rotate_right</span>Free rotate</button>
      <button aria-label="Zoom in" onClick={() => zoom(0.2)}><span className="material-symbols-outlined">zoom_in</span></button>
      <button aria-label="Zoom out" onClick={() => zoom(-0.2)}><span className="material-symbols-outlined">zoom_out</span></button>
      <button onClick={() => {setView(DEFAULT_VIEW);}}><span className="material-symbols-outlined">restart_alt</span>Reset</button>
      <button aria-pressed={compare} onClick={() => setCompare(!compare)}><span className="material-symbols-outlined">compare</span>Compare images</button>
      <button aria-pressed={boxes} onClick={() => setBoxes(!boxes)}>ROI</button>
      <button aria-pressed={xai} disabled={!overlay} onClick={() => setXai(!xai)}>XAI</button>
    </div>
    <div className={`viewer-panels ${compare ? 'compare' : ''}`}>{compare && panel(false, 'Original')}{panel(true, overlay && xai ? `${stale?'STALE · previous result · ':''}Image + XAI` : 'Display image')}</div>
    <div className="viewer-controls">
      {([['brightness','Brightness',30,200,1],['contrast','Contrast',30,250,1],['gamma','Gamma',.3,3,.05],['window','Window (8-bit)',1,255,1],['level','Level (8-bit)',0,255,.5],['localStrength','Local contrast',0,.5,.05],['sharpness','Sharpness',0,1,0.05],['opacity','XAI opacity',0,100,1]] as const).map(([key,label,min,max,step]) => <label key={key}>{label}<output>{view[key]}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={view[key]||0} onChange={e => update(key, Number(e.target.value))} /></label>)}
    </div>
    <p className="view-help">Drag to rotate or pan. Predictions use the latest adjusted image by default; choose the original under Prediction & XAI. Zoom, rotation, and XAI tint do not change model input.</p>
    <div className="local-contrast-actions"><button disabled={!source} onClick={applyLocal}>Apply local contrast at the selected strength</button><button onClick={()=>{setView(v=>({...v,localEnabled:false}));}}>Disable local contrast</button><small>Strength is limited; enhancement may amplify noise. W/L for 8-bit PNG/JPEG is not DICOM windowing.</small>{(enhancementError||adjusted.error)&&<span role="alert">{enhancementError||adjusted.error}</span>}</div>
  </section>;
}
