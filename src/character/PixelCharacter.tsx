import { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { createCharacterFrames, type PetId } from './characterFrames';
import { getCharacterReaction, type ReactionMemory } from './characterAnimations';
export type VisualMode='PET'|'BARS'|'WAVE';
export function PixelCharacter({playing,sleeping,hasPlayed,mode='PET',pet='cat'}:{pet?:PetId;playing:boolean;sleeping:boolean;hasPlayed:boolean;mode?:VisualMode}){
 const canvas=useRef<HTMLCanvasElement>(null);const props=useRef({playing,sleeping,hasPlayed,mode});props.current={playing,sleeping,hasPlayed,mode};
 useEffect(()=>{const ctx=canvas.current!.getContext('2d')!;ctx.imageSmoothingEnabled=false;const frames=createCharacterFrames(pet);let raf=0,last=0,frame=0;const memory:ReactionMemory={state:'idle',until:0,lastBeat:0,lastExcited:0};const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tick=(now:number)=>{raf=requestAnimationFrame(tick);const p=props.current,m=audioEngine.metrics;const fps=p.playing?6+Math.round(m.energy*5):4;if(now-last<1000/fps)return;last=now;frame++;ctx.clearRect(0,0,128,70);ctx.fillStyle='#202a1c';const state=getCharacterReaction(m,p,now,memory);const f=reduced?0:frame%4;
 if(p.mode==='BARS'){for(let i=0;i<5;i++){const h=Math.max(1,Math.round(m.bars[i*3]*10));for(let j=0;j<h;j++){ctx.fillRect(7+i*4,60-j*4,3,3);ctx.fillRect(102+i*4,60-j*4,3,3)}}}
 if(p.mode==='WAVE'){for(let i=0;i<32;i++){const energy=m.bars[Math.floor(i/2)];const y=58-Math.round(Math.sin(i*.55+frame*.7)*energy*10);ctx.fillRect(i*4,y,3,2)}}
 ctx.drawImage(frames[state][f],32,2,64,64);
 if(state==='sleep'){ctx.font='10px monospace';ctx.fillText('z',91,26);ctx.fillText('Z',97,14-(frame%2)*2)}else if(p.playing){const shift=frame%3;ctx.fillRect(99,15+shift,2,8);ctx.fillRect(101,15+shift,4,2);ctx.fillRect(96,22+shift,3,2);ctx.fillRect(23,39-shift,2,7);ctx.fillRect(25,39-shift,3,2);ctx.fillRect(21,44-shift,3,2);if(frame%2===0){ctx.fillRect(19,20,5,1);ctx.fillRect(21,18,1,5);ctx.fillRect(106,45,5,1);ctx.fillRect(108,43,1,5)}}
 };raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf)}},[pet]);
 return <canvas ref={canvas} width={128} height={70} className="pet-canvas" role="img" aria-label={`${pet} is ${sleeping?'sleeping':playing?'dancing to your music':'resting'}`}/>;
}
