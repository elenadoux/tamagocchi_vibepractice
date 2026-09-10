import { Component, type ReactNode } from 'react';
import { TamagotchiDevice } from './components/TamagotchiDevice';
import { LCDScreen } from './components/LCDScreen';
import { useAudio } from './hooks/useAudio';
import { usePlayerUI } from './hooks/usePlayerUI';
import { DEBUG } from './config';
import { useWebMCP } from './hooks/useWebMCP';
class DeviceBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<div className="webgl-error">The little device couldn't start.<br/>Please enable hardware acceleration and reload.</div>:this.props.children}}
export default function App(){
 useWebMCP();
 const state=useAudio(),ui=usePlayerUI(state.isPlaying);const home=ui.screen==='home',details=ui.screen==='details';
 const hint=home?'HOLD THE MIDDLE BUTTON FOR MENU':'LEFT: SELECT · MIDDLE: ENTER · RIGHT: BACK';
 return <main><header className="masthead"><span className="wordmark">tama<span className="wordmark-dot">•</span></span><span className="edition">POCKET MUSIC COMPANION<br/>MODEL 001 · ROSE</span></header><DeviceBoundary><TamagotchiDevice onWake={ui.wake} buttons={[
 {icon:home||details?'⏮':'‹',label:home||details?'Previous track':'Select next item',onAction:ui.left},
 {icon:home||details?(state.isPlaying?'Ⅱ':'▶'):'•',label:home||details?(state.isPlaying?'Pause. Hold to open menu':'Play. Hold to open menu'):'Confirm selection. Hold to open menu',onAction:()=>ui.choose(),onHold:()=>ui.open('menu')},
 {icon:home?'⏭':'↩',label:home?'Next track':'Back',onAction:ui.right}
 ]}><LCDScreen state={state} ui={ui}/></TamagotchiDevice></DeviceBoundary><footer className="footer"><span>A LITTLE MUSIC. A LITTLE COMPANY.</span><span>{hint}</span></footer>{DEBUG&&<pre className="debug">{JSON.stringify({screen:ui.screen,playing:state.isPlaying,loading:state.loading},null,2)}</pre>}</main>
}
