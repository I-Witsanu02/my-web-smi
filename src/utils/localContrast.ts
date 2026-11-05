/** Clipped adaptive histogram mapping for display and explicit YOLO retries. */
export function localContrast(data:Uint8ClampedArray,width:number,height:number,strength:number){
  const nx=Math.min(8,width),ny=Math.min(8,height),maps:Float32Array[]=[];
  const luminance=new Uint8Array(width*height);
  for(let i=0;i<luminance.length;i++)luminance[i]=Math.round(.299*data[i*4]+.587*data[i*4+1]+.114*data[i*4+2]);
  for(let ty=0;ty<ny;ty++)for(let tx=0;tx<nx;tx++){
    const x0=Math.floor(tx*width/nx),x1=Math.floor((tx+1)*width/nx),y0=Math.floor(ty*height/ny),y1=Math.floor((ty+1)*height/ny);
    const n=(x1-x0)*(y1-y0),hist=new Float32Array(256),limit=Math.max(1,2*n/256);let excess=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)hist[luminance[y*width+x]]++;
    for(let k=0;k<256;k++){if(hist[k]>limit){excess+=hist[k]-limit;hist[k]=limit;}}
    const map=new Float32Array(256);let sum=0;
    for(let k=0;k<256;k++){sum+=hist[k]+excess/256;map[k]=255*sum/n;}maps.push(map);
  }
  const out=new Uint8ClampedArray(data);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const gx=Math.max(0,Math.min(nx-1,(x+.5)*nx/width-.5)),gy=Math.max(0,Math.min(ny-1,(y+.5)*ny/height-.5));
    const x0=Math.floor(gx),y0=Math.floor(gy),x1=Math.min(nx-1,x0+1),y1=Math.min(ny-1,y0+1),fx=gx-x0,fy=gy-y0,i=y*width+x,k=luminance[i];
    const a=maps[y0*nx+x0][k]*(1-fx)+maps[y0*nx+x1][k]*fx,b=maps[y1*nx+x0][k]*(1-fx)+maps[y1*nx+x1][k]*fx;
    const delta=((a*(1-fy)+b*fy)-k)*Math.max(0,Math.min(1,strength));
    for(let c=0;c<3;c++)out[i*4+c]=data[i*4+c]+delta;
  }
  return out;
}
