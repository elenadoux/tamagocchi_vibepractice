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
function Shell() {
  const [front,back,rim] = useMemo(() => {
    const f=eggShape(); f.holes.push(screenHole());
    const outline=eggShape(.972).getPoints(120).map(p=>new THREE.Vector3(p.x,p.y,.45));
    return [new THREE.ExtrudeGeometry(f,{depth:.24,bevelEnabled:true,bevelSize:.065,bevelThickness:.065,bevelSegments:5,steps:1,curveSegments:40}),new THREE.ExtrudeGeometry(eggShape(.99),{depth:.12,bevelEnabled:true,bevelSize:.1,bevelThickness:.09,bevelSegments:6,steps:1,curveSegments:40}),new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline,true),120,.025,6,true)];
  },[]);
  useEffect(()=>()=>{front.dispose();back.dispose();rim.dispose()},[front,back,rim]);
  return <>
    <mesh geometry={back} position={[0,0,-.27]}><meshPhysicalMaterial color="#dda6b8" transmission={.28} thickness={.14} roughness={.29} ior={1.43} clearcoat={1}/></mesh>
    <mesh geometry={front} position={[0,0,.12]}><meshPhysicalMaterial color="#f5c4d0" transmission={.78} thickness={.18} attenuationColor="#dfa0b5" attenuationDistance={1.6} roughness={.21} ior={1.43} clearcoat={1} clearcoatRoughness={.18} envMapIntensity={1.05}/></mesh>
    <ShellInternals/>
    <mesh geometry={rim} position={[0,0,-.32]} scale={[.925,.925,1]}><meshStandardMaterial color="#c58d9f" roughness={.36}/></mesh>
    <mesh geometry={rim}><meshPhysicalMaterial color="#ffd0d9" roughness={.22} transparent opacity={.67} clearcoat={1}/></mesh>
    <mesh geometry={rim} position={[0,0,-.33]} scale={[1.025,1.025,1]}><meshStandardMaterial color="#b86780" roughness={.4}/></mesh>
    <RoundedBox args={[2.41,2.41,.10]} radius={.21} smoothness={5} position={[0,.22,.33]}><meshPhysicalMaterial color="#e8b4bd" roughness={.3} metalness={.25}/></RoundedBox>
    <RoundedBox args={[2.25,2.25,.10]} radius={.13} smoothness={5} position={[0,.22,.41]}><meshStandardMaterial color="#626957" roughness={.56}/></RoundedBox>
    <RoundedBox args={[.36,.39,.3]} radius={.1} position={[0,2.05,.05]}><meshPhysicalMaterial color="#f0b7c8" roughness={.23} transmission={.55} thickness={.16} clearcoat={1}/></RoundedBox>
    <mesh position={[0,2.14,.23]}><torusGeometry args={[.096,.035,12,32]}/><meshStandardMaterial color="#e5d9ca" roughness={.24} metalness={1}/></mesh>
    <group position={[0,2.39,.13]} rotation={[0,.30,-.10]}>
      <mesh scale={[.64,1,1]}><torusGeometry args={[.23,.042,12,40]}/><meshStandardMaterial color="#9b9b8e" roughness={.19} metalness={1}/></mesh>
      <mesh position={[.018,.29,-.025]} rotation={[0,1.32,.1]} scale={[.65,1,1]}><torusGeometry args={[.19,.037,12,36]}/><meshStandardMaterial color="#b6b4a9" roughness={.2} metalness={1}/></mesh>
    </group>
  </>;
}

type ButtonProps = { index: number; icon: string; label: string; onAction: ()=>void; onHold?: ()=>void; onWake: ()=>void };
function DeviceButton({index,icon,label,onAction,onHold,onWake}: ButtonProps) {
  const moving=useRef<THREE.Group>(null); const pressed=useRef(false); const hover=useRef(false); const timer=useRef<ReturnType<typeof setTimeout>>(); const consumed=useRef(false);
  const x=(index-1)*.67, y=index===1?-1.59:-1.43;
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useFrame((_,delta)=>{if(moving.current){moving.current.position.z=THREE.MathUtils.damp(moving.current.position.z,pressed.current?-.064:hover.current?.014:0,pressed.current?28:16,delta);const s=pressed.current?.95:1;moving.current.scale.setScalar(THREE.MathUtils.damp(moving.current.scale.x,s,20,delta));}});
  function cancel(){clearTimeout(timer.current);pressed.current=false;consumed.current=true;}
  return <group position={[x,y,.49]}>
    <mesh><torusGeometry args={[.196,.03,16,48]}/><meshStandardMaterial color="#94546b" metalness={.2} roughness={.32}/></mesh>
    <group ref={moving}>
      <mesh position={[0,0,.018]} scale={[1,1,.48]}><sphereGeometry args={[.177,32,24]}/><meshPhysicalMaterial color="#efb1c0" roughness={.28} metalness={.13} clearcoat={1}/></mesh>
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
function Scene({children,buttons,onWake}: {children:ReactNode;buttons:Omit<ButtonProps,'index'|'onWake'>[];onWake:()=>void}) {
  const group=useRef<THREE.Group>(null);const target=useRef({x:0,y:0}); const {camera,size}=useThree();
  useEffect(()=>{const c=camera as THREE.OrthographicCamera;c.zoom=Math.min(size.height/6.35,size.width/4.4,150);c.updateProjectionMatrix()},[camera,size]);
  useEffect(()=>{if(!matchMedia('(pointer: fine)').matches)return;const move=(e:PointerEvent)=>{target.current={x:(e.clientX/innerWidth-.5)*2,y:(e.clientY/innerHeight-.5)*2}};const reset=()=>{target.current={x:0,y:0}};window.addEventListener('pointermove',move);document.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);return()=>{window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset)}},[]);
  useFrame((_,dt)=>{if(!group.current)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;group.current.scale.setScalar(1+(reduce?0:audioEngine.metrics.bass*.003));group.current.position.x=THREE.MathUtils.damp(group.current.position.x,reduce?0:target.current.x*DEVICE_CONFIG.hoverOffset,5,dt);group.current.position.y=THREE.MathUtils.damp(group.current.position.y,-.05+(reduce?0:-target.current.y*DEVICE_CONFIG.hoverOffset*.7),5,dt);group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,reduce?0:target.current.y*DEVICE_CONFIG.tiltX*Math.PI/180,5,dt);group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,reduce?0:target.current.x*DEVICE_CONFIG.tiltY*Math.PI/180,5,dt)});
  return <>
    <ambientLight intensity={.9}/><directionalLight position={[-3,5,7]} intensity={3.2} color="#fff5ec"/><directionalLight position={[4,1,4]} intensity={1.4} color="#dfe8ff"/>
    <Environment resolution={128}><Lightformer form="rect" intensity={3} position={[-3,4,5]} scale={[3,6,1]} rotation={[0,.4,0]}/><Lightformer form="rect" intensity={2} position={[4,0,3]} scale={[1,5,1]} rotation={[0,-.7,0]}/><Lightformer form="ring" intensity={1} position={[0,4,-2]} scale={4}/></Environment>
    <group ref={group} position={[0,-.05,0]}>
      <Shell/>
      <Html transform distanceFactor={4} scale={.8} center position={[0,.22,.485]} style={{width:256,height:256}}>{children}</Html>
      {buttons.map((p,index)=><DeviceButton key={index} {...p} index={index} onWake={onWake}/>)}
    </group>
    <ContactShadows position={[0,-2.31,0]} opacity={.3} scale={9} blur={2.8} far={4} resolution={256} color="#716053" frames={1}/>
  </>;
}
export function TamagotchiDevice(props:Parameters<typeof Scene>[0]) {
  return <div className="device-stage"><Canvas orthographic camera={{position:[0,0,9],zoom:100,near:.1,far:40}} dpr={[1,1.75]} gl={{antialias:true,alpha:true}}><Suspense fallback={null}><Scene {...props}/></Suspense></Canvas></div>;
}
