export type CharacterState='idle'|'playing'|'dance'|'jump'|'excited'|'paused'|'sleep';
export const pets=[{id:'cat',label:'CAT'},{id:'dog',label:'DOG'},{id:'rabbit',label:'RABBIT'},{id:'bird',label:'BIRD'},{id:'frog',label:'FROG'}] as const;
export type PetId=typeof pets[number]['id'];
export function isPetId(value:unknown):value is PetId{return pets.some(p=>p.id===value)}
// Original 32×32 pixel silhouettes. Masks are composed on an integer grid,
// then outlined pixel by pixel: no antialiased vector edges or emoji assets.
export function createCharacterFrames(pet:PetId='cat'){
 const states:CharacterState[]=['idle','playing','dance','jump','excited','paused','sleep'];
 const result={} as Record<CharacterState,HTMLCanvasElement[]>;
 for(const state of states)result[state]=Array.from({length:4},(_,frame)=>{
  const c=document.createElement('canvas');c.width=32;c.height=32;const ctx=c.getContext('2d')!;ctx.fillStyle='#202a1c';ctx.imageSmoothingEnabled=false;
  const rest=state==='paused'||state==='sleep',active=['playing','dance','jump','excited'].includes(state);
  const dy=state==='jump'?[0,-2,-3,-1][frame]:active?[0,-1,0,1][frame]:frame===2?1:0;
  const dx=active?[0,1,0,-1][frame]:0;const mask=new Set<string>();
  const put=(x:number,y:number)=>{if(x>=0&&x<32&&y>=0&&y<32)mask.add(`${x},${y}`)};
  const ellipse=(cx:number,cy:number,rx:number,ry:number)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y)};
  const polygon=(points:number[][])=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[u,v]=points[j];if((b>y)!==(v>y)&&x<(u-a)*(y-b)/(v-b)+a)inside=!inside}if(inside)put(x,y)}};
  const bodyY=rest?21:19,bodyHeight=rest?6:8;
  ellipse(16,bodyY,pet==='frog'?10:8,bodyHeight);
  // Feet and limbs keep their distinct species silhouette through every state.
  // Dancing lifts the feet in alternation so the pet visibly steps.
  const kickL=state==='dance'?[0,-2,0,1][frame]:0,kickR=state==='dance'?[0,1,0,-2][frame]:0;
  ellipse(11,27+kickL,pet==='frog'?5:3,2);ellipse(21,27+kickR,pet==='frog'?5:3,2);
  const lift=active?(frame%2===0?-2:2):1;
  if(pet==='cat'){
   // One rounded head blob merged with the body, small ears rooted inside it,
   // so the silhouette stays a single clean 1px outline. The tail flicks softly
   // on idle and swings wide while dancing.
   ellipse(16,15,8,7);
   polygon([[8,12],[10,6],[14,12]]);polygon([[18,12],[22,6],[24,12]]);
   const flick=state==='dance'?[0,-2,0,2][frame]:[0,0,-1,0][frame];
   ellipse(25,24,2,2);ellipse(27,22+flick,1,2);
  }else if(pet==='dog'){
   ellipse(8,13,4,7);ellipse(24,13,4,7);ellipse(16,22,5,3);
   ellipse(26,23,3,1);ellipse(28,21-frame%2,1,3);
  }else if(pet==='rabbit'){
   ellipse(11,9,3,8);ellipse(21,9+(frame%2),3,8);ellipse(25,24,3,3);
  }else if(pet==='bird'){
   polygon([[13,13],[11,7],[16,10],[19,6],[20,13]]);
   ellipse(7,20+lift,4,active?4:3);ellipse(25,20-lift,4,active?4:3);
  }else{
   ellipse(10,12,4,5);ellipse(22,12,4,5);ellipse(7,25,4,3);ellipse(25,25,4,3);
  }
  if(pet!=='bird'&&pet!=='cat'){ellipse(7,21+lift,2,2);ellipse(25,21-lift,2,2)}
  const pixel=(x:number,y:number,w=1,h=1)=>ctx.fillRect(x+dx,y+dy,w,h);
  for(const key of mask){const [x,y]=key.split(',').map(Number);if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>!mask.has(`${x+a},${y+b}`)))pixel(x,y)}
  const eyeY=pet==='frog'?12:pet==='cat'?15:18,blink=state==='sleep'||(!active&&frame===3);
  const eyeX=pet==='frog'?[10,22]:[12,20];eyeX.forEach(x=>pixel(x-1,eyeY,blink?3:2,blink?1:3));
  if(pet==='bird'){pixel(15,21,3,1);pixel(16,22);pixel(11,28,1,2);pixel(21,28,1,2)}
  else if(pet==='frog'){pixel(12,21,9,1);pixel(11,20);pixel(21,20);pixel(8,19,2);pixel(24,19,2)}
  else if(pet==='cat'){pixel(15,17,2,1);pixel(14,18);pixel(15,19,2,1);pixel(18,18);pixel(6,15,3,1);pixel(23,15,3,1);pixel(7,18,3,1);pixel(23,18,3,1)}
  else{pixel(15,21,3,1);pixel(16,22);pixel(13,23,3,1);pixel(17,23,3,1)}
  if(pet==='dog'){pixel(7,12,2,5);pixel(24,12,2,5);if(active)pixel(16,24,2,2)}
  if(pet==='rabbit'){pixel(11,5,1,7);pixel(21,5+frame%2,1,7)}
  if(state==='excited'){pixel(9,22,2);pixel(23,22,2)}
  return c;
 });return result;
}
