import sourceUrl from '../assets/cat-states-source.png';
import type {CharacterState} from './characterFrames';
// The supplied artwork has one distinct pose for each state. Keep those poses
// intact and add only small, stepped offsets; do not invent missing limb frames.
const regions:Record<CharacterState,[number,number,number,number]>={
 idle:[46,197,273,265],playing:[393,178,290,283],dance:[773,166,298,306],jump:[1118,117,291,298],excited:[138,615,317,315],paused:[582,658,298,270],sleep:[976,733,336,197]
};
export type CatFrames=Record<CharacterState,HTMLCanvasElement[]>;
let loading:Promise<CatFrames>|undefined;
export function loadCatFrames():Promise<CatFrames>{
 if(loading)return loading;
 loading=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Could not load cat artwork'));image.src=sourceUrl}).then(image=>{
  const result={} as CatFrames;
  for(const [state,rect] of Object.entries(regions) as [CharacterState,[number,number,number,number]][]){
   const [x,y,w,h]=rect;const tile=document.createElement('canvas');tile.width=w;tile.height=h;const ctx=tile.getContext('2d')!;ctx.drawImage(image,x,y,w,h,0,0,w,h);
   // Runtime sprite matte: remove only pale, neutral background pixels connected
   // to the outside. Enclosed white fur and cheek highlights survive.
   const pixels=ctx.getImageData(0,0,w,h),data=pixels.data,seen=new Uint8Array(w*h),queue:number[]=[];
   const add=(i:number)=>{if(seen[i])return;seen[i]=1;const k=i*4,r=data[k],g=data[k+1],b=data[k+2];if(Math.min(r,g,b)>150&&Math.max(r,g,b)-Math.min(r,g,b)<24)queue.push(i)};
   for(let xx=0;xx<w;xx++){add(xx);add((h-1)*w+xx)}for(let yy=0;yy<h;yy++){add(yy*w);add(yy*w+w-1)}
   for(let at=0;at<queue.length;at++){const i=queue[at];data[i*4+3]=0;if(i%w>0)add(i-1);if(i%w<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w)}
   // Quantize the supplied colored art to the device's monochrome LCD palette.
   // Keep the fur, cheeks, ears and dark outline readable in four tones.
   const palette=[[32,42,28],[104,125,82],[157,178,131],[187,201,160]];
   for(let k=0;k<data.length;k+=4){if(data[k+3]===0)continue;const luminance=.2126*data[k]+.7152*data[k+1]+.0722*data[k+2];const tone=palette[luminance<95?0:luminance<175?1:luminance<220?2:3];data[k]=tone[0];data[k+1]=tone[1];data[k+2]=tone[2]}
   // Reconstruct a native 32×32 sprite, matching the other pets. Each cell
   // has one solid color and binary alpha; the silhouette gets a 1px outline.
   // The renderer enlarges this grid exactly 2×, never fractional scaling.
   const size=32,padding=3,scale=Math.min(26/w,26/h);
   const gw=Math.round(w*scale),gh=Math.round(h*scale);
   const ox=Math.floor((size-gw)/2),oy=size-padding-gh;
   const cells=new Int8Array(size*size).fill(-1);
   for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
    const votes=[0,0,0,0];let visible=0;
    for(let sy=0;sy<3;sy++)for(let sx=0;sx<3;sx++){
     const px=Math.min(w-1,Math.floor((gx+(sx+.5)/3)*w/gw));
     const py=Math.min(h-1,Math.floor((gy+(sy+.5)/3)*h/gh));
     const k=(py*w+px)*4;if(!data[k+3])continue;visible++;
     const tone=palette.findIndex(p=>p[0]===data[k]);if(tone>=0)votes[tone]++;
    }
    if(visible<5)continue;
    cells[(oy+gy)*size+ox+gx]=votes[0]>=2?0:votes.indexOf(Math.max(...votes));
   }
   const base=document.createElement('canvas');base.width=size;base.height=size;
   const baseCtx=base.getContext('2d')!;baseCtx.imageSmoothingEnabled=false;
   for(let yy=0;yy<size;yy++)for(let xx=0;xx<size;xx++){
    const tone=cells[yy*size+xx];if(tone<0)continue;
    const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>xx+dx<0||xx+dx>=size||yy+dy<0||yy+dy>=size||cells[(yy+dy)*size+xx+dx]<0);
    const color=palette[edge?0:tone];baseCtx.fillStyle=`rgb(${color.join(',')})`;baseCtx.fillRect(xx,yy,1,1);
   }
   result[state]=Array.from({length:4},(_,frame)=>{
    const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const draw=canvas.getContext('2d')!;draw.imageSmoothingEnabled=false;
    const active=['playing','dance','excited'].includes(state);
    const dx=active?[0,1,0,-1][frame]:0;
    const dy=state==='jump'?[0,-1,-2,-1][frame]:active?[0,-1,0,1][frame]:0;
    draw.drawImage(base,dx,dy);return canvas;
   });
  }return result;
 });return loading;
}
