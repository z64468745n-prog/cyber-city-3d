import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Stars } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Mode = 'FIRST PERSON' | 'THIRD PERSON';
type Keys = Record<string, boolean>;
const cityBlocks = Array.from({length: 11}, (_, x) => Array.from({length: 11}, (_, z) => ({x:(x-5)*15,z:(z-5)*15,h:7+((x*17+z*23)%7)*2.2,w:7+((x*7+z*13)%4)*1.3,d:7+((x*11+z*3)%4)*1.3, hue:(x*29+z*41)%360}))).flat().filter(b=>Math.abs(b.x)>9 || Math.abs(b.z)>9);

function Building({b}:{b:typeof cityBlocks[number]}) {
 const color = new THREE.Color().setHSL(b.hue/360,.42,.12);
 return <group position={[b.x,b.h/2,b.z]}>
  <mesh castShadow receiveShadow><boxGeometry args={[b.w,b.h,b.d]}/><meshStandardMaterial color={color} roughness={.82} metalness={.45}/></mesh>
  <mesh position={[0,b.h/2+.04,0]}><boxGeometry args={[b.w+.15,.12,b.d+.15]}/><meshBasicMaterial color={b.hue%2?'#00eaff':'#ff2d9b'}/></mesh>
  {Array.from({length:Math.floor(b.h/2.5)},(_,i)=><group key={i} position={[0,-b.h/2+1.3+i*2.5,b.d/2+.012]}>
   {Array.from({length:Math.max(1,Math.floor(b.w/1.8))},(_,j)=><mesh key={j} position={[(j-(Math.floor(b.w/1.8)-1)/2)*1.8,0,0]}><planeGeometry args={[.75,1.1]}/><meshBasicMaterial color={b.hue%2?'#00d9ff':'#ff4ca5'} transparent opacity={.62}/></mesh>)}
  </group>)}
 </group>;
}

function Rain({enabled}:{enabled:boolean}) {
 const ref=useRef<THREE.Group>(null);
 const drops=useMemo(()=>Array.from({length:420},()=>({x:(Math.random()-.5)*90,y:Math.random()*34,z:(Math.random()-.5)*90,s:.12+Math.random()*.18})),[]);
 useFrame((_,dt)=>{if(ref.current&&enabled) ref.current.children.forEach((o,i)=>{o.position.y-=dt*25;if(o.position.y<.1)o.position.y=34;});});
 if(!enabled)return null;
 return <group ref={ref}>{drops.map((d,i)=><mesh key={i} position={[d.x,d.y,d.z]}><boxGeometry args={[.018,d.s,.018]}/><meshBasicMaterial color="#72dcff" transparent opacity={.45}/></mesh>)}</group>;
}

function Player({mode,keys,active}:{mode:Mode,keys:React.MutableRefObject<Keys>,active:boolean}) {
 const group=useRef<THREE.Group>(null); const {camera}=useThree(); const yaw=useRef(0); const pitch=useRef(0);
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{keys.current[e.key.toLowerCase()]=true;};
  const up=(e:KeyboardEvent)=>{keys.current[e.key.toLowerCase()]=false;};
  const move=(e:MouseEvent)=>{if(document.pointerLockElement){yaw.current-=e.movementX*.0022;pitch.current=THREE.MathUtils.clamp(pitch.current-e.movementY*.0018,-1.15,1.15);}};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('mousemove',move);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('mousemove',move);};
 },[keys]);
 useFrame((_,dt)=>{
  if(!group.current)return;
  const k=keys.current;const forward=Number(k.w||k.arrowup)-Number(k.s||k.arrowdown);const side=Number(k.d||k.arrowright)-Number(k.a||k.arrowleft);
  const speed=(k.shift?13:7)*dt;const direction=new THREE.Vector3(side,0,-forward).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw.current);
  group.current.position.add(direction.multiplyScalar(speed));group.current.position.x=THREE.MathUtils.clamp(group.current.position.x,-72,72);group.current.position.z=THREE.MathUtils.clamp(group.current.position.z,-72,72);
  if(mode==='FIRST PERSON'){camera.position.set(group.current.position.x,1.72,group.current.position.z);camera.rotation.order='YXZ';camera.rotation.y=yaw.current;camera.rotation.x=pitch.current;}
  else {const offset=new THREE.Vector3(0,3.1,7.5).applyAxisAngle(new THREE.Vector3(0,1,0),yaw.current);camera.position.lerp(group.current.position.clone().add(offset),1-Math.pow(.001,dt));camera.lookAt(group.current.position.x,1.25,group.current.position.z);group.current.rotation.y=yaw.current;}
 });
 return <group ref={group} position={[0,0,0]}>{mode==='THIRD PERSON'&&<group position={[0,0,0]}><mesh position={[0,1.1,0]} castShadow><capsuleGeometry args={[.38,.9,4,8]}/><meshStandardMaterial color="#111827" metalness={.65} roughness={.3}/></mesh><mesh position={[0,1.95,0]} castShadow><sphereGeometry args={[.27,16,16]}/><meshStandardMaterial color="#9deaff" emissive="#00bde8" emissiveIntensity={.35}/></mesh><mesh position={[0,1.2,-.42]}><boxGeometry args={[.55,.7,.08]}/><meshBasicMaterial color="#00eaff"/></mesh></group>}</group>;
}

function City({mode,keys,rain,active,onInfo}:{mode:Mode,keys:React.MutableRefObject<Keys>,rain:boolean,active:boolean,onInfo:(s:string)=>void}) {
 const roadMat=<meshStandardMaterial color="#080b13" roughness={.32} metalness={.7}/>;
 return <>
  <color attach="background" args={['#050711']}/><fog attach="fog" args={['#080b18',22,115]}/>
  <ambientLight intensity={.55}/><hemisphereLight args={['#8beaff','#111322',.6]}/>
  <directionalLight position={[15,28,8]} intensity={1.1} color="#a9dfff"/>
  <pointLight position={[0,9,0]} intensity={22} distance={45} color="#00cfff"/>
  <pointLight position={[20,7,-20]} intensity={18} distance={35} color="#ff268e"/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.16,0]} receiveShadow><planeGeometry args={[180,180]}/><meshStandardMaterial color="#080b13" roughness={.25} metalness={.72}/></mesh>
  {Array.from({length:25},(_,i)=><mesh key={'lane'+i} rotation={[-Math.PI/2,0,0]} position={[(i-12)*7.5,-.145,0]}><planeGeometry args={[.07,180]}/><meshBasicMaterial color="#193849"/></mesh>)}
  {cityBlocks.map((b,i)=><Building key={i} b={b}/>)}
  <group position={[0,0,0]}><mesh position={[0,.08,-11]}><boxGeometry args={[7,.16,.3]}/><meshBasicMaterial color="#ff238d"/></mesh><Html position={[0,5,-11]} center distanceFactor={13}><button className="world-label" onClick={()=>onInfo('NIGHT MARKET — Street food, underground fashion and local vendors.')}>NIGHT MARKET · OPEN</button></Html></group>
  <group position={[16,0,13]}><mesh position={[0,2.8,0]}><boxGeometry args={[6,5.6,6]}/><meshStandardMaterial color="#141a2d" emissive="#071c35"/></mesh><Html position={[0,6,0]} center distanceFactor={13}><button className="world-label" onClick={()=>onInfo('NEXUS TOWER — The city transit and communications hub.')}>NEXUS TOWER</button></Html></group>
  <Stars radius={100} depth={45} count={1000} factor={3} fade speed={.2}/>
  <Rain enabled={rain}/>
  <Player mode={mode} keys={keys} active={active}/>
 </>;
}

export default function App(){
 const [started,setStarted]=useState(false);const [mode,setMode]=useState<Mode>('FIRST PERSON');const [rain,setRain]=useState(true);const [panel,setPanel]=useState('');const [paused,setPaused]=useState(false);const keys=useRef<Keys>({});
 const enter=()=>{setStarted(true);setPaused(false);};
 const toggleMode=()=>setMode(m=>m==='FIRST PERSON'?'THIRD PERSON':'FIRST PERSON');
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==='v')toggleMode();if(e.key==='Escape')setPaused(true);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const hold=(key:string,on:boolean)=>{keys.current[key]=on;};
 return <main className="app">
  <header className="topbar"><div className="brand"><span className="brand-mark">◈</span> CYBER<span>CITY</span><small> / 3D</small></div><div className="top-right"><span className="live-dot"/> CITY SYSTEM ONLINE <span className="top-sep">|</span> SECTOR 07</div></header>
  {!started?<section className="intro"><div className="intro-grid"/><div className="intro-copy"><div className="eyebrow"><i/> INTERACTIVE WORLD // 2089</div><h1>THE CITY<br/><em>NEVER</em> SLEEPS.</h1><p>Step into a neon-drenched future. Explore the streets, discover hidden districts, and move through a living city after dark.</p><button className="primary" onClick={enter}>ENTER THE CITY <span>↗</span></button><div className="intro-meta"><span>01 / FIRST-PERSON + THIRD-PERSON</span><span>WEBGL EXPERIENCE</span></div></div><div className="intro-art"><div className="sun"/><div className="tower t1"/><div className="tower t2"/><div className="tower t3"/><div className="tower t4"/><div className="art-caption">NIGHT DISTRICT <b>07</b></div></div><div className="scroll-note">SCROLL TO EXPLORE <span>↓</span></div></section>
  :<><div className="hud"><div className="hud-left"><div className="hud-tag">DISTRICT 07 <b>● LIVE</b></div><div className="hud-title">NEON QUARTER</div><div className="hud-sub">COORDINATES // 07.24.89</div></div><div className="hud-right"><button onClick={toggleMode}>{mode} <span>⇄</span></button><button onClick={()=>setRain(v=>!v)}>RAIN: {rain?'ON':'OFF'}</button><button onClick={()=>setPaused(v=>!v)}>{paused?'RESUME':'PAUSE'}Ⅱ</button></div></div>
   <div className="scene-wrap" onClick={()=>{if(mode==='FIRST PERSON'&&!paused&&started)document.body.requestPointerLock?.();}}><Canvas shadows dpr={[1,1.5]} camera={{position:[0,1.7,0],fov:72}} gl={{antialias:true, powerPreference:'high-performance'}}><Suspense fallback={null}><City mode={mode} keys={keys} rain={rain} active={started&&!paused} onInfo={setPanel}/></Suspense></Canvas></div>
   <div className="controls-hint">W A S D <span>MOVE</span> · MOUSE <span>LOOK</span> · SHIFT <span>SPRINT</span> · V <span>SWITCH VIEW</span></div>
   <div className="mobile-pad"><div className="dpad"><button onPointerDown={()=>hold('w',true)} onPointerUp={()=>hold('w',false)} onPointerLeave={()=>hold('w',false)}>▲</button><div><button onPointerDown={()=>hold('a',true)} onPointerUp={()=>hold('a',false)} onPointerLeave={()=>hold('a',false)}>◀</button><button onPointerDown={()=>hold('s',true)} onPointerUp={()=>hold('s',false)} onPointerLeave={()=>hold('s',false)}>▼</button><button onPointerDown={()=>hold('d',true)} onPointerUp={()=>hold('d',false)} onPointerLeave={()=>hold('d',false)}>▶</button></div></div><div className="mobile-tip">Use the arrows to walk<br/>Tap SWITCH VIEW to follow your character</div></div>
   {paused&&<div className="overlay"><div className="modal"><div className="eyebrow">SYSTEM PAUSED</div><h2>TAKE A BREATHER.</h2><button className="primary" onClick={()=>setPaused(false)}>RESUME EXPLORING ↗</button><button className="text-btn" onClick={()=>{setStarted(false);setPaused(false);}}>RETURN TO MAIN MENU</button></div></div>}
   {panel&&<div className="info-card"><button onClick={()=>setPanel('')}>×</button><div className="eyebrow">LOCATION DISCOVERED</div><p>{panel}</p></div>}
  </>}
  <footer><span>© 2089 CYBER CITY SYSTEMS</span><span>BUILT FOR EXPLORATION <b>◆</b></span></footer>
 </main>;
}

// Cyber City 3D initial playable build.

// Cloudflare Pages production build trigger.

// Build trigger after Pages path filter update.
