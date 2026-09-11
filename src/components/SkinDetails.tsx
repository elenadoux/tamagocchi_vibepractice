import {useMemo,useEffect} from 'react';
import * as THREE from 'three';
import type {Skin} from './Customization';
export function useSkinTexture(id:string){
 const texture=useMemo(()=>{
  if(!['04','07','08','10'].includes(id))return null;
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!;
  g.fillStyle=id==='07'?'#ffffff':'#c6c6c6';g.fillRect(0,0,256,256);
  let seed=73;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  if(id==='10'){
   const image=g.createImageData(256,256);
   const palette=[[247,225,236],[213,233,244],[217,239,215],[247,236,204],[232,219,246]];
   for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const u=x/256,v=y/256;
    const phase=(u*2.8+v*1.7+.48*Math.sin(v*13+u*5)+.25*Math.cos(u*17-v*8))*2;
    const band=((phase%5)+5)%5,index=Math.floor(band),blend=band-index;
    const a=palette[index],b=palette[(index+1)%5],k=(y*256+x)*4;
    for(let channel=0;channel<3;channel++)image.data[k+channel]=a[channel]*(1-blend)+b[channel]*blend;
    image.data[k+3]=255;
   }
   g.putImageData(image,0,0);
  }else if(id==='07'){
   for(let i=0;i<12;i++){g.strokeStyle='rgba(205,150,170,.18)';g.lineWidth=3+rand()*9;g.beginPath();g.moveTo(-20,rand()*256);g.bezierCurveTo(80,rand()*256,150,rand()*256,280,rand()*256);g.stroke()}
  }else for(let i=0;i<2300;i++){const v=90+Math.floor(rand()*130);g.fillStyle=`rgb(${v},${v},${v})`;g.beginPath();g.arc(rand()*256,rand()*256,.3+rand()*1.3,0,7);g.fill()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(id==='10'?1:.8,id==='10'?1:.8);if(id==='10')t.colorSpace=THREE.SRGBColorSpace;return t;
 },[id]);useEffect(()=>()=>texture?.dispose(),[texture]);return texture;
}
function emblem(kind:string){
 const s=new THREE.Shape();
 if(kind==='bat'){
 const p=[[-.15,.06],[-.07,.025],[-.04,.08],[0,.045],[.04,.08],[.07,.025],[.15,.06],[.12,-.035],[.075,-.015],[.035,-.065],[0,-.025],[-.035,-.065],[-.075,-.015],[-.12,-.035]];
 p.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));
 }else for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.04:.095;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
 s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:2});
}
export function SkinDetails({skin}:{skin:Skin}){
 const star=useMemo(()=>emblem('star'),[]),bat=useMemo(()=>emblem('bat'),[]);
 useEffect(()=>()=>{star.dispose();bat.dispose()},[star,bat]);
 const points=[[-.62,1.67],[.43,1.72],[-1.34,.62],[1.34,.45],[-1.4,-.45],[1.36,-.78],[-.96,-1.51],[.52,-1.9]];
 return <>
 {['03','04','12'].includes(skin.id)&&points.map(([x,y],i)=><mesh key={i} geometry={skin.id==='04'?bat:star} position={[x,y,.64]} rotation={[0,0,i*.7]} scale={skin.id==='04'?1: .75+(i%3)*.15}><meshPhysicalMaterial color={skin.id==='04'?(i%2?'#151618':'#49464b'):skin.id==='12'?'#edc684':i%2?'#f2cee9':'#d9ecee'} metalness={.35} roughness={.26} clearcoat={1} iridescence={skin.id==='04'?0:.8}/></mesh>)}
 {skin.id==='12'&&[[-1.35,-.05],[.86,1.45]].map(([x,y],i)=><group key={i} position={[x,y,.65]} rotation={[.2,.3,i?.4:-.4]}><mesh><sphereGeometry args={[.095,24,16]}/><meshPhysicalMaterial color={i?'#d5abea':'#e5bb93'} metalness={.3} roughness={.18} iridescence={1}/></mesh><mesh rotation={[.65,0,0]}><torusGeometry args={[.15,.017,8,32]}/><meshStandardMaterial color="#e9cb8c" metalness={.7} roughness={.22}/></mesh></group>)}
 {skin.id==='09'&&[-1,1].map(sign=><group key={sign}>{[0,1,2,3].map(i=><group key={i} position={[sign*1.33,.7-i*.43,.35]}><mesh><boxGeometry args={[.12,.23,.025]}/><meshStandardMaterial color="#b3ef36" emissive="#86bb21" emissiveIntensity={.2} roughness={.38}/></mesh><mesh position={[sign*.045,-.15,0]}><boxGeometry args={[.018,.12,.025]}/><meshStandardMaterial color="#c4ff53" metalness={.45}/></mesh></group>)}</group>)}
 </>;
}
