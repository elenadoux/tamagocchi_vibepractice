import type {CharacterState} from './characterFrames';

// Hand-placed pixels: one ink color, transparent interior, no image resampling.
export function createCatFrames():Record<CharacterState,HTMLCanvasElement[]> {
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
   line([[5,26],[4,24],[5,21],[6,19],[6,14],[8,14],[11,17],[15,17],[18,14],[20,14],[20,19],[22,22],[22,26],[5,26]]);
   line([[21,16],[24,17],[27,20],[28,24],[26,26],[23,26]]);
   line([[26,26],[29,25],[30,27],[28,28],[23,28],[23,26]]);
   line([[8,21],[10,21]]);line([[16,21],[18,21]]);
   dot(13,22);line([[12,23],[14,23]]);
   line([[7,25],[8,24],[9,25]]);line([[16,25],[17,24],[18,25]]);
   return canvas;
  }
  // Tall, softly rounded torso and short ears match the reference silhouette.
  line([[8,9],[8,4],[10,4],[12,6],[18,6],[21,4],[23,4],[23,9],
   [24,11],[25,13],[26,16],[26,20],[25,23],[24,26],[22,28],
   [9,28],[7,26],[6,23],[5,20],[5,16],[6,13],[7,11],[8,9]]);
  const flick=frame===2?-1:0;
  line([[7,25],[5,24+flick],[3,24+flick],[2,26],[3,28],[8,28]]);
  line([[6,14],[7,14]]);line([[5,17],[7,17]]);
  line([[24,14],[25,14]]);line([[24,17],[26,17]]);
  if(state==='paused'||frame===3&&state==='idle'){
   line([[11,12],[13,12]]);line([[19,12],[21,12]]);
  }else if(['playing','dance','jump'].includes(state)){
   line([[11,12],[12,11],[13,12]]);line([[19,12],[20,11],[21,12]]);
  }else if(state==='excited'){
   line([[11,11],[13,12],[11,13]]);line([[21,11],[19,12],[21,13]]);
  }else{line([[12,11],[12,13]]);line([[20,11],[20,13]]);}
  dot(16,14);line([[14,15],[15,15],[16,14],[17,15],[18,15]]);
  const dancing=state==='dance'||state==='playing';
  if(dancing||state==='excited'||state==='jump'){
   const left=state==='excited'? -3:dancing?[0,-2,0,1][frame]:-2;
   const right=state==='excited'? -3:dancing?[0,1,0,-2][frame]:-2;
   line([[9,21+left],[8,20+left],[8,18+left],[10,17+left],[12,18+left],[12,19+left]]);
   line([[20,19+right],[20,18+right],[22,17+right],[24,18+right],[24,20+right],[23,21+right]]);
  }
  line([[11,25],[11,27],[12,28]]);line([[16,24],[16,28]]);line([[21,25],[21,27],[20,28]]);
  return canvas;
 })])) as Record<CharacterState,HTMLCanvasElement[]>;
}
