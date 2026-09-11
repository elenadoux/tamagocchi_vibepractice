import type {Skin} from './Customization';
import {useSkinTexture} from './SkinDetails';
import {useMemo,useEffect} from 'react';
import * as THREE from 'three';

// Closed annular shell: a domed front, a recessed inner face and rolled edges.
// Matching radial samples keep the screen opening clear at every depth.
function shellGeometry(){
 const n=192,rows=32,positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 for(let j=0;j<=rows;j++){
  const v=j/rows*Math.PI*2;
  const t=(1-Math.cos(v))/2;
  for(let i=0;i<=n;i++){
   const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
   const outerX=1.62*c*(1-.17*Math.max(0,s));
   const outerY=2.12*s;
   // Superellipse approximates the rounded rectangular display bezel.
   const radial=1/Math.pow(Math.pow(Math.abs(c),10)+Math.pow(Math.abs(s),10),.1);
   const innerX=1.19*c*radial,innerY=.22+1.19*s*radial;
   const z=.16+Math.sin(v)*.30+(.18*(1-t));
   const x=innerX*(1-t)+outerX*t,y=innerY*(1-t)+outerY*t;
   positions.push(x,y,z);uvs.push((x+1.7)/3.4,(y+2.2)/4.4);
  }
 }
 for(let j=0;j<rows;j++)for(let i=0;i<n;i++){
  const a=j*(n+1)+i,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function BubblegumBody({skin}:{skin:Skin}){
 const {color,material}=skin;
 const texture=useSkinTexture(material==='Pearl'?'10':skin.id);
 const geometry=useMemo(shellGeometry,[]);
 const piping=useMemo(()=>{
  const pts=Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2;return new THREE.Vector3(1.60*Math.cos(a)*(1-.17*Math.max(0,Math.sin(a))),2.10*Math.sin(a),.10)});
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),192,.025,8,true);
 },[]);
 useEffect(()=>()=>{geometry.dispose();piping.dispose()},[geometry,piping]);
 const clear=material==='Jelly'||material==='Glass';
 return <>
 <mesh geometry={geometry}><meshPhysicalMaterial color={new THREE.Color(color).lerp(new THREE.Color('white'),clear?.65:0)} transmission={clear?.94:0} thickness={.42} ior={1.46} attenuationColor={color} attenuationDistance={1.5} roughness={material==='Matte'||material==='Ceramic'?.7:material==='Metal'?.17:.095} metalness={material==='Metal'?1:material==='Pearl'?.28:0} map={skin.id==='07'||material==='Pearl'?texture:null} iridescenceThicknessMap={material==='Pearl'?texture:null} bumpMap={skin.id==='04'||skin.id==='08'?texture:null} bumpScale={skin.id==='04'?.055:.025} roughnessMap={skin.id==='04'||skin.id==='08'?texture:null} iridescence={material==='Pearl'||skin.id==='12'?1:0} iridescenceIOR={1.8} iridescenceThicknessRange={[100,650]} clearcoat={1} clearcoatRoughness={.065} envMapIntensity={material==='Metal'?1.8:1.35} side={THREE.DoubleSide}/></mesh>
 <mesh geometry={piping}><meshPhysicalMaterial color={color} roughness={.17} metalness={.1} clearcoat={1}/></mesh>
 {clear&&<group>
 {[-1,1].map(sign=><group key={sign}>
  {[0,1,2,3].map(i=><mesh key={i} position={[sign*(1.37-i*.025),-.7+i*.39,.09]} rotation={[0,0,sign*.12]}><capsuleGeometry args={[.035,.16,4,12]}/><meshPhysicalMaterial color="#ffd9e8" roughness={.2} clearcoat={1}/></mesh>)}
  <mesh position={[sign*.68,1.66,.08]}><torusGeometry args={[.115,.034,12,32]}/><meshPhysicalMaterial color={color} roughness={.2} clearcoat={1}/></mesh>
 </group>)}
 {Array.from({length:9},(_,i)=><mesh key={i} position={[(i-4)*.19,-1.86+.05*Math.abs(i-4),.08]} rotation={[0,0,(i-4)*.06]}><boxGeometry args={[.065,.12,.04]}/><meshStandardMaterial color={color} roughness={.3} metalness={.35}/></mesh>)}
 <mesh position={[.32,1.68,.12]} rotation={[0,0,.35]}><torusGeometry args={[.065,.018,8,20]}/><meshStandardMaterial color="#f2d7ad" metalness={.8} roughness={.23}/></mesh>
 </group>}
 </>;
}
