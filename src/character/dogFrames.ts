import type {CharacterState} from './characterFrames';

// Hand-placed pixels: one ink color, transparent interior, no image resampling.
export function createDogFrames():Record<CharacterState,HTMLCanvasElement[]> {
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
   line([[4,25],[4,21],[6,18],[9,16],[14,16],[18,18],[20,22],[19,26],[16,28],[6,28],[4,25]]);
   line([[8,19],[6,23],[5,25],[3,24],[3,21],[5,18],[9,16]]);
   line([[16,19],[17,24],[19,25],[21,23],[20,20],[18,18]]);
   line([[20,17],[24,18],[27,21],[29,25],[28,28],[17,28]]);
   line([[8,23],[10,23]]);line([[14,23],[16,23]]);
   dot(12,24);line([[11,25],[13,25]]);
   return canvas;
  }
  // A domed head, hanging ears and narrower seated torso.
  line([[5,15],[4,13],[4,11],[6,8],[9,6],[12,4],[18,4],[21,6],[24,8],[26,11],[26,14],[24,16]]);
  const flop=frame===2?1:0;
  line([[10,8],[9,11],[8,14+flop],[6,16+flop],[4,15]]);
  line([[21,8],[22,11],[23,14+flop],[24,16+flop],[26,14]]);
  line([[7,16],[8,18],[9,19],[8,22],[7,25],[8,28],[23,28],[24,25],[23,22],[22,19],[23,18],[24,16]]);
  const wag=frame===2?-1:0;
  line([[24,24],[26,24],[26,21+wag],[28,21+wag],[29,23],[28,26],[24,27]]);
  if(state==='paused'||frame===3&&state==='idle'){
   line([[11,13],[13,13]]);line([[19,13],[21,13]]);
  }else if(['playing','dance','jump'].includes(state)){
   line([[11,13],[12,12],[13,13]]);line([[19,13],[20,12],[21,13]]);
  }else if(state==='excited'){
   line([[11,12],[13,13],[11,14]]);line([[21,12],[19,13],[21,14]]);
  }else{line([[12,12],[12,14]]);line([[20,12],[20,14]]);}
  dot(16,16);line([[14,17],[15,17],[16,16],[17,17],[18,17]]);
  const dancing=state==='dance'||state==='playing';
  if(dancing||state==='excited'||state==='jump'){
   const left=state==='excited'? -3:dancing?[0,-2,0,1][frame]:-2;
   const right=state==='excited'? -3:dancing?[0,1,0,-2][frame]:-2;
   line([[9,21+left],[8,20+left],[8,18+left],[10,17+left],[12,18+left],[12,19+left]]);
   line([[20,19+right],[20,18+right],[22,17+right],[24,18+right],[24,20+right],[23,21+right]]);
  }
  // Seated front paws disappear whenever the front paws are raised.
  if(state==='idle'||state==='paused'){
   line([[10,25],[10,27],[11,28]]);line([[16,24],[16,28]]);line([[22,25],[22,27],[21,28]]);
  }
  return canvas;
 })])) as Record<CharacterState,HTMLCanvasElement[]>;
}
