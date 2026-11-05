/** Invert a center-origin viewport transform; fitted image dimensions exclude padding. */
export function imagePoint(x:number,y:number,cx:number,cy:number,width:number,height:number,zoom:number,rotation:number){
  const angle=-rotation*Math.PI/180,dx=x-cx,dy=y-cy;
  return {x:50+100*(dx*Math.cos(angle)-dy*Math.sin(angle))/(zoom*width),y:50+100*(dx*Math.sin(angle)+dy*Math.cos(angle))/(zoom*height)};
}
