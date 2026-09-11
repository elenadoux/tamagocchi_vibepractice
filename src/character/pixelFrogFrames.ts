import type {CharacterState} from './characterFrames';

// Hand-placed pixels: one ink color, transparent interior, no image resampling.
export function createFrogFrames():Record<CharacterState,HTMLCanvasElement[]> {
 const states:CharacterState[]=['idle','playing','dance','jump','excited','paused','sleep'];
 return Object.fromEntries(states.map(state=>[state,Array.from({length:4},(_,frame)=>{
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#202a1c';
  const dy=state==='jump'?[0,-2,-3,-1][frame]:state==='sleep'?0:[0,0,-1,0][frame];
  const dot=(x:number,y:number)=>ctx.fillRect(x,y+dy,1,1);
  // Bresenham segments keep diagonal steps exactly one pixel wide.
  const line=(points:number[][])=>{for(let i=1;i<points.length;i++){
   let [x,y]=points[i-1];const [tx,ty]=points[i];
   const dx=Math.abs(tx-x),dy=Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let err=dx-dy;
   for(;;){dot(x,y);if(x===tx&&y===ty)break;const e=2*err;if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}}
  }};
  if(state==='sleep'){
   line([[4,24],[5,20],[6,17],[7,14],[10,14],[12,15],[18,15],[20,14],[23,14],[25,17],[26,23]]);
   line([[25,17],[28,19],[30,24],[29,27],[24,28],[8,28],[4,26],[4,24]]);
   line([[8,20],[9,21],[11,21],[12,20]]);line([[19,20],[20,21],[22,21],[23,20]]);
   line([[15,22],[17,22]]);
   line([[7,27],[7,25],[9,24],[11,25],[12,28]]);line([[18,28],[19,25],[22,24]]);
   return canvas;
  }
  line([[4,23],[5,19],[6,15],[7,10],[7,7],[9,5],[12,5],[14,6],[19,6],[21,5],[24,5],[26,7],[26,11],[27,16],[28,20],[28,24]]);
  line([[4,23],[4,25],[6,27],[8,28],[24,28],[27,26],[28,24]]);
  const closed=state==='paused'||state==='idle'&&frame===3;
  for(const x of [10,22]){
   if(closed)line([[x-1,9],[x+1,9]]);
   else if(state==='playing'||state==='excited')line([[x-1,10],[x-1,9],[x,8],[x+1,9],[x+1,10]]);
   else {for(let yy=8;yy<=10;yy++)for(let xx=x-1;xx<=x+1;xx++)if(!(xx===x&&yy===8))dot(xx,yy);}
  }
  if(state==='excited')line([[15,12],[17,12],[17,14],[15,14],[15,12]]);
  else line([[15,12],[17,12]]);
  const active=['playing','dance','jump','excited'].includes(state);
  if(active){
   const l=state==='excited'?-3:[0,-2,0,1][frame],r=state==='excited'?-3:[0,1,0,-2][frame];
   line([[10,20+l],[8,21+l],[6,20+l],[6,18+l],[8,17+l],[10,18+l]]);
   line([[21,18+r],[23,17+r],[25,18+r],[25,20+r],[23,21+r],[21,20+r]]);
  }else{
   line([[11,20],[12,22],[13,24],[11,25]]);line([[23,20],[22,22],[22,24],[24,25]]);
  }
  line([[8,28],[6,26],[6,24],[8,23],[10,24],[12,27],[11,29],[8,29],[8,28]]);
  line([[23,29],[22,27],[23,24],[26,23],[28,24],[28,27],[26,29],[23,29]]);
  return canvas;
 })])) as Record<CharacterState,HTMLCanvasElement[]>;
}
