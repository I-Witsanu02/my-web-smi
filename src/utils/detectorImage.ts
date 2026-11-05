import type { ViewSettings } from '../components/ResearchViewer';
import { localContrast } from './localContrast';

// Preserve native dimensions and coordinates; omit viewport transforms and overlays.
export async function detectorImage(img: HTMLImageElement, view: ViewSettings): Promise<File> {
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('สร้างภาพสำหรับตรวจจับไม่ได้');
  ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  if(view.localEnabled)pixels.data.set(localContrast(pixels.data,canvas.width,canvas.height,view.localStrength??.2));
  const clamp=(v:number)=>Math.max(0,Math.min(255,v));
  const w=view.window??255,l=view.level??127.5,g=view.gamma??1;
  for(let i=0;i<pixels.data.length;i+=4)for(let c=0;c<3;c++){
    const normalized=Math.max(0,Math.min(1,(pixels.data[i+c]-l)/w+.5));
    pixels.data[i+c]=255*Math.pow(normalized,1/g);
  }
  const before=new Uint8ClampedArray(pixels.data),width=canvas.width,height=canvas.height,s=view.sharpness;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<3;c++){
    const at=(xx:number,yy:number)=>before[(Math.max(0,Math.min(height-1,yy))*width+Math.max(0,Math.min(width-1,xx)))*4+c];
    const value=clamp(at(x,y)*(1+4*s)-s*(at(x-1,y)+at(x+1,y)+at(x,y-1)+at(x,y+1)));
    pixels.data[(y*width+x)*4+c]=clamp((clamp(value*view.brightness/100)-127.5)*view.contrast/100+127.5);
  }
  ctx.putImageData(pixels,0,0);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้าง PNG ไม่สำเร็จ')),'image/png'));
  return new File([blob],'adjusted_detector_input.png',{type:'image/png'});
}
