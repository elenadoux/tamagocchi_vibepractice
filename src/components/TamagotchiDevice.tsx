import {SkinDetails,useSkinTexture} from './SkinDetails';
import {BubblegumBody} from './BubblegumBody';
import type {Skin} from './Customization';
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { DEVICE_CONFIG } from '../config';
import { audioEngine } from '../audio/AudioEngine';

function eggShape(scale = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, 2.12 * scale);
  s.bezierCurveTo(.94*scale,2.12*scale,1.57*scale,.89*scale,1.62*scale,-.38*scale);
  s.bezierCurveTo(1.72*scale,-1.50*scale,1.02*scale,-2.10*scale,0,-2.10*scale);
  s.bezierCurveTo(-1.02*scale,-2.10*scale,-1.72*scale,-1.50*scale,-1.62*scale,-.38*scale);
  s.bezierCurveTo(-1.57*scale,.89*scale,-.94*scale,2.12*scale,0,2.12*scale);
  return s;
}
function screenHole() {
  const p = new THREE.Path(); const l=-1.13, r=1.13, b=-.91, t=1.35, d=.18;
  p.moveTo(l+d,b); p.lineTo(r-d,b); p.quadraticCurveTo(r,b,r,b+d); p.lineTo(r,t-d); p.quadraticCurveTo(r,t,r-d,t); p.lineTo(l+d,t); p.quadraticCurveTo(l,t,l,t-d); p.lineTo(l,b+d); p.quadraticCurveTo(l,b,l+d,b);
  return p;
}
// Opaque internals sit between the back cover and the transmissive front shell.
// They give the plastic something physical to reveal as the viewing angle changes.
function ShellInternals() {
  const posts = [[-.66,1.62],[.66,1.62],[-1.36,-.22],[1.36,-.22],[-1.03,-1.35],[1.03,-1.35]];
  return <group>
    {posts.map(([x,y],i)=><group key={i} position={[x,y,.13]}>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.102,.12,.15,20]}/><meshStandardMaterial color="#c38298" roughness={.36}/></mesh>
      <mesh position={[0,0,.085]}><torusGeometry args={[.079,.018,10,24]}/><meshPhysicalMaterial color="#f4bccc" roughness={.25} clearcoat={.8}/></mesh>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,0,.083]}><cylinderGeometry args={[.045,.045,.024,16]}/><meshStandardMaterial color="#beb8aa" metalness={.8} roughness={.32}/></mesh>
      <mesh position={[0,0,.097]} rotation={[0,0,i*.5]}><boxGeometry args={[.055,.011,.003]}/><meshStandardMaterial color="#69615d" roughness={.5}/></mesh>
    </group>)}
    {[-1,1].flatMap(sign=>[-.75,-.48,.16,.46,.73].map((y,i)=><mesh key={`${sign}-${i}`} position={[sign*(1.35-Math.max(0,y)*.1),y,.12]} rotation={[0,0,sign*-.15]}>
      <boxGeometry args={[.18,.034,.14]}/><meshPhysicalMaterial color="#d497ab" roughness={.3} clearcoat={.65}/>
    </mesh>))}
    <RoundedBox args={[1.57,.25,.055]} radius={.035} smoothness={2} position={[0,-1.13,.11]}><meshStandardMaterial color="#b18c91" roughness={.55}/></RoundedBox>
    <RoundedBox args={[.35,.15,.045]} radius={.018} smoothness={2} position={[0,-1.12,.16]}><meshStandardMaterial color="#686063" roughness={.55}/></RoundedBox>
    {[-1,1].flatMap(sign=>[0,1,2,3].map(i=><mesh key={`${sign}-${i}`} position={[sign*(.23+i*.12),-1.12,.15]}><boxGeometry args={[.055,.026,.015]}/><meshStandardMaterial color="#c4ac80" metalness={.55} roughness={.4}/></mesh>))}
  </group>;
}
function Shell({skin}: {skin:Skin}) {
 const texture=useSkinTexture(skin.id);
 const transparent=skin.material==='Jelly'||skin.material==='Glass';
 const material={color:skin.color,roughness:skin.material==='Matte'||skin.material==='Ceramic'?.8:skin.material==='Metal'?.08:.23,metalness:skin.material==='Metal'?1:0,transmission:transparent?.72:0,thickness:.18,clearcoat:1,iridescence:skin.material==='Pearl'||skin.id==='12'?1:0,iridescenceIOR:1.8,iridescenceThicknessRange:[100,650] as [number,number],envMapIntensity:skin.material==='Metal'||skin.material==='Pearl'?1.8:1, map:skin.id==='07'?texture:null,bumpMap:skin.id==='04'||skin.id==='08'?texture:null,bumpScale:skin.id==='04'?.055:.025,roughnessMap:skin.id==='04'||skin.id==='08'?texture:null};
  const [front,back,rim] = useMemo(() => {
    const f=eggShape(); f.holes.push(screenHole());
    const outline=eggShape(.972).getPoints(120).map(p=>new THREE.Vector3(p.x,p.y,.45));
    return [new THREE.ExtrudeGeometry(f,{depth:.24,bevelEnabled:true,bevelSize:.065,bevelThickness:.065,bevelSegments:5,steps:1,curveSegments:40}),new THREE.ExtrudeGeometry(eggShape(.99),{depth:.12,bevelEnabled:true,bevelSize:.1,bevelThickness:.09,bevelSegments:6,steps:1,curveSegments:40}),new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline,true),120,.025,6,true)];
  },[]);
  useEffect(()=>()=>{front.dispose();back.dispose();rim.dispose()},[front,back,rim]);
  return <>
    <mesh geometry={back} position={[0,0,-.43]}><meshPhysicalMaterial {...material} transmission={transparent?.45:0} roughness={transparent?.14:material.roughness}/></mesh>
    <BubblegumBody skin={skin}/>
    {transparent&&<ShellInternals/>}
    <mesh geometry={rim} position={[0,0,-.32]} scale={[.925,.925,1]}><meshStandardMaterial color={skin.color} roughness={.36}/></mesh>
    
    <mesh geometry={rim} position={[0,0,-.33]} scale={[1.025,1.025,1]}><meshStandardMaterial color={skin.color} roughness={.4}/></mesh>
    <RoundedBox args={[2.41,2.41,.10]} radius={.21} smoothness={5} position={[0,.22,.33]}><meshPhysicalMaterial color={skin.color} roughness={.3} metalness={.25}/></RoundedBox>
    <RoundedBox args={[2.25,2.25,.10]} radius={.13} smoothness={5} position={[0,.22,.41]}><meshStandardMaterial color="#626957" roughness={.56}/></RoundedBox>
    <RoundedBox args={[.36,.39,.3]} radius={.1} position={[0,2.05,.05]}><meshPhysicalMaterial color={skin.color} roughness={.23} transmission={.55} thickness={.16} clearcoat={1}/></RoundedBox>
    <mesh position={[0,2.14,.23]}><torusGeometry args={[.096,.035,12,32]}/><meshStandardMaterial color="#e5d9ca" roughness={.24} metalness={1}/></mesh>
    <group position={[0,2.39,.13]} rotation={[0,.30,-.10]}>
      <mesh scale={[.64,1,1]}><torusGeometry args={[.23,.042,12,40]}/><meshStandardMaterial color="#9b9b8e" roughness={.19} metalness={1}/></mesh>
      <mesh position={[.018,.29,-.025]} rotation={[0,1.32,.1]} scale={[.65,1,1]}><torusGeometry args={[.19,.037,12,36]}/><meshStandardMaterial color="#b6b4a9" roughness={.2} metalness={1}/></mesh>
    </group>
  </>;
}

type ButtonProps = { skin:Skin; index: number; icon: string; label: string; onAction: ()=>void; onHold?: ()=>void; onWake: ()=>void };
function DeviceButton({skin,index,icon,label,onAction,onHold,onWake}: ButtonProps) {
  const moving=useRef<THREE.Group>(null); const pressed=useRef(false); const hover=useRef(false); const timer=useRef<ReturnType<typeof setTimeout>>(); const consumed=useRef(false);
  const x=(index-1)*.67, y=index===1?-1.59:-1.43;
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useFrame((_,delta)=>{if(moving.current){moving.current.position.z=THREE.MathUtils.damp(moving.current.position.z,pressed.current?-.064:hover.current?.014:0,pressed.current?28:16,delta);const s=pressed.current?.95:1;moving.current.scale.setScalar(THREE.MathUtils.damp(moving.current.scale.x,s,20,delta));}});
  function cancel(){clearTimeout(timer.current);pressed.current=false;consumed.current=true;}
  return <group position={[x,y,.63]}>
    {!skin.buttons&&<mesh><torusGeometry args={[.196,.03,16,48]}/><meshStandardMaterial color={skin.id==='01'?'#ded6d4':skin.color} metalness={skin.id==='01'?.95:.2} roughness={.18}/></mesh>}
    <group ref={moving}>
      <ButtonCap skin={skin}/>
      <Html transform distanceFactor={4} position={[0,0,.115]} center style={{pointerEvents:'auto'}}>
        <button className="physical-button" aria-label={label} title={label}
          onPointerEnter={()=>hover.current=true} onPointerLeave={()=>hover.current=false}
          onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);onWake();pressed.current=true;consumed.current=false;if(onHold)timer.current=setTimeout(()=>{consumed.current=true;onHold()},DEVICE_CONFIG.longPressMs)}}
          onPointerUp={()=>{clearTimeout(timer.current);if(pressed.current&&!consumed.current)onAction();pressed.current=false}}
          onPointerCancel={cancel} onLostPointerCapture={()=>{clearTimeout(timer.current);pressed.current=false}}
          onClick={e=>{if(e.detail===0){onWake();onAction()}}}>{icon}</button>
      </Html>
    </group>
  </group>;
}
function Scene({children,buttons,onWake,skin}: {skin:Skin;children:ReactNode;buttons:Omit<ButtonProps,'index'|'onWake'|'skin'>[];onWake:()=>void}) {
  const group=useRef<THREE.Group>(null);const target=useRef({x:0,y:0}); const {camera,size}=useThree();
  useEffect(()=>{const c=camera as THREE.OrthographicCamera;c.zoom=Math.min(size.height/6.35,size.width/4.4,150);c.updateProjectionMatrix()},[camera,size]);
  useEffect(()=>{if(!matchMedia('(pointer: fine)').matches)return;const move=(e:PointerEvent)=>{target.current={x:(e.clientX/innerWidth-.5)*2,y:(e.clientY/innerHeight-.5)*2}};const reset=()=>{target.current={x:0,y:0}};window.addEventListener('pointermove',move);document.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);return()=>{window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset)}},[]);
  useFrame((_,dt)=>{if(!group.current)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;group.current.scale.setScalar(1+(reduce?0:audioEngine.metrics.bass*.003));group.current.position.x=THREE.MathUtils.damp(group.current.position.x,reduce?0:target.current.x*DEVICE_CONFIG.hoverOffset,5,dt);group.current.position.y=THREE.MathUtils.damp(group.current.position.y,-.05+(reduce?0:-target.current.y*DEVICE_CONFIG.hoverOffset*.7),5,dt);group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,reduce?0:target.current.y*DEVICE_CONFIG.tiltX*Math.PI/180,5,dt);group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,reduce?0:target.current.x*DEVICE_CONFIG.tiltY*Math.PI/180,5,dt)});
  return <>
    <ambientLight intensity={.28}/><directionalLight position={[-3,5,7]} intensity={1.5} color="#fff5ec"/><directionalLight position={[4,1,4]} intensity={.6} color="#dfe8ff"/>
    <Environment resolution={256}>{skin.material==='Metal'&&<>
      <Lightformer form="rect" color="#f3f1ec" intensity={1.6} position={[0,0,6]} scale={[12,12,1]}/>
      <Lightformer form="rect" intensity={4} position={[-4,0,3]} rotation={[0,.8,0]} scale={[2,8,1]}/>
      <Lightformer form="rect" intensity={2.5} position={[4,2,1]} rotation={[0,-1.1,0]} scale={[3,7,1]}/>
      <Lightformer form="rect" color="#d4d7dc" intensity={1.3} position={[0,-4,2]} rotation={[-.9,0,0]} scale={[8,4,1]}/>
      <Lightformer form="rect" intensity={1.5} position={[0,2,-5]} rotation={[0,Math.PI,0]} scale={[10,10,1]}/>
    </>}{<><Lightformer form="rect" intensity={5} position={[-4,1,3]} scale={[1,6,1]} rotation={[0,.8,0]}/><Lightformer form="rect" intensity={4} position={[1,5,2]} scale={[5,1,1]} rotation={[.6,0,0]}/><Lightformer color={skin.id==='01'?'#ff8fbf':'#ffffff'} form="rect" intensity={3} position={[3,-1,-3]} scale={[2,5,1]} rotation={[0,2.5,0]}/></>}<Lightformer form="rect" intensity={3} position={[-3,4,5]} scale={[3,6,1]} rotation={[0,.4,0]}/><Lightformer form="rect" intensity={2} position={[4,0,3]} scale={[1,5,1]} rotation={[0,-.7,0]}/><Lightformer form="ring" intensity={1} position={[0,4,-2]} scale={4}/></Environment>
    <group ref={group} position={[0,-.05,0]}>
      <Shell skin={skin}/><ShellExtras skin={skin}/><SkinDetails skin={skin}/>
      <Html transform distanceFactor={4} scale={.77} center position={[0,.22,.462]} style={{width:256,height:256,borderRadius:18,overflow:'hidden',clipPath:'inset(0 round 18px)'}}>{children}</Html>
      {buttons.map((p,index)=><DeviceButton skin={skin} key={index} {...p} index={index} onWake={onWake}/>)}
    </group>
    <ContactShadows position={[0,-2.31,0]} opacity={.3} scale={9} blur={2.8} far={4} resolution={256} color="#716053" frames={1}/>
  </>;
}
export function TamagotchiDevice(props:Parameters<typeof Scene>[0]) {
  return <div className="device-stage"><Canvas orthographic camera={{position:[0,0,9],zoom:100,near:.1,far:40}} dpr={[1,1.75]} gl={{antialias:true,alpha:true}}><Suspense fallback={null}><Scene {...props}/></Suspense></Canvas></div>;
}

function ButtonCap({skin}:{skin:Skin}){
 const geometry=useMemo(()=>{
  const shape=new THREE.Shape();
  if(skin.buttons==='heart'){
   shape.moveTo(0,-.19);shape.bezierCurveTo(-.32,.02,-.20,.27,0,.12);shape.bezierCurveTo(.20,.27,.32,.02,0,-.19);
  }else if(skin.buttons==='flower'){
   for(let i=0;i<=120;i++){const a=i/120*Math.PI*2,r=.17+.04*Math.cos(a*5);if(i===0)shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);else shape.lineTo(Math.cos(a)*r,Math.sin(a)*r)}
  }else return null;
  return new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1});
 },[skin.buttons]);
 useEffect(()=>()=>geometry?.dispose(),[geometry]);
 const mat=<meshPhysicalMaterial color={skin.button} roughness={.16} clearcoat={1} clearcoatRoughness={.08}/>;
 if(skin.buttons==='flower')return <group position={[0,0,.04]}>{Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5+Math.PI/2;return <mesh key={i} position={[Math.cos(a)*.112,Math.sin(a)*.112,0]} scale={[1,1,.8]}><sphereGeometry args={[.105,24,16]}/>{mat}</mesh>})}<mesh position={[0,0,.055]} scale={[1,1,.65]}><sphereGeometry args={[.077,24,16]}/><meshPhysicalMaterial color="#f3dfad" roughness={.28} clearcoat={.8}/></mesh></group>;
 if(geometry)return <mesh geometry={geometry} position={[0,0,.015]}>{mat}</mesh>;
 if(skin.buttons==='square'||skin.buttons==='pill')return <RoundedBox args={[skin.buttons==='pill'?.43:.33,.32,.12]} radius={skin.buttons==='pill'?.12:.055} position={[0,0,.025]}>{mat}</RoundedBox>;
 return <mesh position={[0,0,.018]} scale={[1,1,.48]}><sphereGeometry args={[.177,32,24]}/>{mat}</mesh>;
}
function ShellExtras({skin}:{skin:Skin}){
 const horn=useMemo(()=>{
  const shape=new THREE.Shape();shape.moveTo(-.22,0);shape.bezierCurveTo(-.30,.26,-.13,.62,.05,.73);shape.bezierCurveTo(-.02,.39,.06,.25,.23,.14);shape.quadraticCurveTo(.22,-.08,-.22,0);
  return new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSize:.065,bevelThickness:.06,bevelSegments:4,curveSegments:20});
 },[]);
 useEffect(()=>()=>horn.dispose(),[horn]);
 return <>
 {skin.shape==='horns'&&[-1,1].map(sign=><mesh key={sign} geometry={horn} position={[sign*1.02,1.62,.16]} scale={[sign===1?-1:1,1,1]}><meshPhysicalMaterial color={skin.color} roughness={.4} clearcoat={.5}/></mesh>)}
 {skin.shape==='ears'&&[-1,1].map(sign=><group key={sign} position={[sign*.98,1.78,.1]} rotation={[0,0,-sign*.3]}><mesh scale={[.9,1,.65]}><coneGeometry args={[.43,.85,3,1]}/><meshPhysicalMaterial color={skin.color} roughness={.25} clearcoat={1}/></mesh></group>)}

 </>;
}
