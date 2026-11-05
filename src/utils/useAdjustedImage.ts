import { useEffect, useState } from 'react';
import { api } from '../api';
import type { ViewSettings } from '../components/ResearchViewer';
import { detectorImage } from './detectorImage';

export function useAdjustedImage(source:string, settings:ViewSettings) {
  const [native,setNative]=useState<{source:string;image:HTMLImageElement}|null>(null);
  const [render,setRender]=useState<{source:string;url:string}|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true,url='';setNative(null);setRender(null);setError('');
    if(source)api.fetchAsset(source).then(blob=>{
      if(!active)return;url=URL.createObjectURL(blob);const img=new Image();
      img.onload=()=>{if(active)setNative({source,image:img});};
      img.onerror=()=>{if(active)setError('โหลดภาพสำหรับปรับไม่ได้');};img.src=url;
    }).catch(()=>{if(active)setError('โหลดภาพสำหรับปรับไม่ได้');});
    return()=>{active=false;if(url)URL.revokeObjectURL(url);};
  },[source]);
  useEffect(()=>{
    if(!native||native.source!==source)return;
    let active=true,url='';
    const timer=window.setTimeout(async()=>{
      try{const file=await detectorImage(native.image,settings);if(!active)return;url=URL.createObjectURL(file);setRender({source,url});setError('');}
      catch{if(active)setError('ปรับภาพไม่สำเร็จ');}
    },100);
    return()=>{active=false;window.clearTimeout(timer);if(url)URL.revokeObjectURL(url);};
  },[native,source,settings.brightness,settings.contrast,settings.gamma,settings.window,settings.level,settings.sharpness,settings.localStrength,settings.localEnabled]);
  return {url:render?.source===source?render.url:'',image:native?.source===source?native.image:null,error};
}
