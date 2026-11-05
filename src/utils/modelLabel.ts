export function modelLabel(id:string, fallback='โมเดล') {
  if(id.includes('feedback_candidate'))return 'FocalNet 1–18 ปี · Feedback candidate';
  if(id.includes('pre2'))return 'FocalNet 1–5 ปี';
  if(id.includes('convnext'))return 'ConvNeXtV2 1–18 ปี';
  if(id.includes('swin'))return 'Swin 1–18 ปี';
  if(id.includes('efficientnet'))return 'EfficientNetV2 1–18 ปี';
  if(id.includes('focalnet'))return 'FocalNet 1–18 ปี';
  return fallback.split('—')[0].trim();
}
