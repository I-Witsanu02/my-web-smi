import type { ViewSettings } from '../components/ResearchViewer';
const DEFAULT_INTENSITY = {brightness:100,contrast:100,sharpness:0,gamma:1,window:255,level:127.5,localStrength:.2,localEnabled:false};

// Only intensity operations belong to the model input, never viewport or XAI styling.
export function intensitySettings(view: Partial<ViewSettings> = {}) {
  const v = {...DEFAULT_INTENSITY, ...view};
  return {brightness:v.brightness, contrast:v.contrast, sharpness:v.sharpness,
    gamma:v.gamma, window:v.window, level:v.level, localEnabled:Boolean(v.localEnabled),
    localStrength:v.localEnabled?v.localStrength:DEFAULT_INTENSITY.localStrength};
}
export function inputKey(mode: 'latest'|'original' = 'latest', view: Partial<ViewSettings> = {}) {
  return JSON.stringify(intensitySettings(mode==='original'?{}:view));
}
export async function inferenceImage(source:string, view:Partial<ViewSettings> = {}) {
  const {api}=await import('../api');
  const {detectorImage}=await import('./detectorImage');
  const {DEFAULT_VIEW}=await import('../components/ResearchViewer');
  const blob=await api.fetchAsset(source);
  const url=URL.createObjectURL(blob);
  try {
    const img=new Image();
    await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('โหลดภาพเพื่อทำนายไม่สำเร็จ'));img.src=url;});
    return await detectorImage(img,{...DEFAULT_VIEW,...view});
  } finally {URL.revokeObjectURL(url);}
}
