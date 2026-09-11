import {useEffect,useRef} from 'react';
import {createCharacterFrames,type PetId} from './characterFrames';
export function PetThumbnail({pet}:{pet:PetId}){const ref=useRef<HTMLCanvasElement>(null);useEffect(()=>{const ctx=ref.current!.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,32,32);ctx.drawImage(createCharacterFrames(pet).idle[0],0,0);},[pet]);return <canvas ref={ref} width={32} height={32} aria-hidden="true"/>}
