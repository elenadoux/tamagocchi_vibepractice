import { tracks } from './tracks';
import { DEVICE_CONFIG } from '../config';
export type AudioMetrics = { bass:number;mids:number;highs:number;energy:number;bassHit:boolean;beatAt:number;bars:number[] };
export type Playback = { currentTrackIndex:number;isPlaying:boolean;currentTime:number;duration:number;volume:number;loading:boolean;error:string|null;hasPlayed:boolean };
export function readLocal<T>(key:string,fallback:T):T { try {const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback} }
export function saveLocal(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value))}catch{/* Private browsing can disable storage. */}}
export class AudioEngine {
  readonly audio=new Audio();
  readonly metrics:AudioMetrics={bass:0,mids:0,highs:0,energy:0,bassHit:false,beatAt:0,bars:Array(16).fill(0)};
  private context?:AudioContext;private analyser?:AnalyserNode;private source?:MediaElementAudioSourceNode;private data?:Uint8Array;
  private listeners=new Set<()=>void>();private desiredPlaying=false;private operation=0;private raf=0;private averageBass=0;private previousSample=0;
  private state:Playback={currentTrackIndex:0,isPlaying:false,currentTime:0,duration:0,volume:.7,loading:!!tracks.length,error:tracks.length?null:'NO TRACKS',hasPlayed:false};
  constructor(){
    const volume=readLocal<unknown>('tama-volume',.7);this.state.volume=typeof volume==='number'&&Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.7;
    this.audio.preload='metadata';this.audio.volume=this.state.volume;
    this.audio.addEventListener('timeupdate',()=>this.update({currentTime:this.audio.currentTime}));
    this.audio.addEventListener('durationchange',()=>this.update({duration:Number.isFinite(this.audio.duration)?this.audio.duration:0}));
    this.audio.addEventListener('loadedmetadata',()=>this.update({loading:false,error:null}));
    this.audio.addEventListener('waiting',()=>this.update({loading:true}));
    this.audio.addEventListener('canplay',()=>this.update({loading:false}));
    this.audio.addEventListener('playing',()=>{if(!this.desiredPlaying){this.audio.pause();return}this.update({isPlaying:true,hasPlayed:true,loading:false,error:null});this.startAnalysis()});
    this.audio.addEventListener('pause',()=>{this.update({isPlaying:false});this.stopAnalysis()});
    this.audio.addEventListener('ended',()=>this.select((this.state.currentTrackIndex+1)%tracks.length,true));
    this.audio.addEventListener('error',()=>{this.desiredPlaying=false;this.update({error:'TRACK ERROR',loading:false,isPlaying:false});this.stopAnalysis()});
    if(tracks[0])this.audio.src=tracks[0].src;
  }
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
  getSnapshot=()=>this.state;
  private update(patch:Partial<Playback>){this.state={...this.state,...patch};this.listeners.forEach(fn=>fn())}
  private setupAnalysis(){
    if(this.context)return;
    this.context=new AudioContext();this.analyser=this.context.createAnalyser();this.analyser.fftSize=1024;this.analyser.smoothingTimeConstant=.76;
    this.source=this.context.createMediaElementSource(this.audio);this.source.connect(this.analyser);this.analyser.connect(this.context.destination);this.data=new Uint8Array(this.analyser.frequencyBinCount);
  }
  async play(){
    if(!tracks.length)return;
    this.desiredPlaying=true;const operation=++this.operation;this.update({error:null,loading:this.audio.readyState<3});
    try {this.setupAnalysis();await this.context!.resume();if(operation!==this.operation||!this.desiredPlaying)return;await this.audio.play()}
    catch(error){if(operation!==this.operation||(error instanceof DOMException&&error.name==='AbortError'))return;this.desiredPlaying=false;this.update({isPlaying:false,loading:false,error:error instanceof DOMException&&error.name==='NotAllowedError'?'PRESS PLAY AGAIN':'TRACK ERROR'})}
  }
  pause(){this.desiredPlaying=false;++this.operation;this.audio.pause();this.update({isPlaying:false,loading:false});this.stopAnalysis()}
  toggle=()=>{if(this.desiredPlaying)this.pause();else void this.play()};
  select(index:number,play=this.desiredPlaying){
    if(!tracks.length)return;
    ++this.operation;this.audio.pause();this.desiredPlaying=play;
    const next=(index%tracks.length+tracks.length)%tracks.length;
    this.update({currentTrackIndex:next,currentTime:0,duration:0,isPlaying:false,loading:true,error:null});
    this.audio.src=tracks[next].src;this.audio.load();if(play)void this.play();
  }
  next=()=>this.select(this.state.currentTrackIndex+1);
  previous=()=>this.select(this.state.currentTrackIndex-1);
  seek=(ratio:number)=>{if(this.state.duration>0){this.audio.currentTime=Math.max(0,Math.min(1,ratio))*this.state.duration;this.update({currentTime:this.audio.currentTime})}};
  setVolume=(volume:number)=>{const v=Math.max(0,Math.min(1,volume));this.audio.volume=v;this.update({volume:v});saveLocal('tama-volume',v)};
  private startAnalysis(){if(this.raf)return;const tick=(now:number)=>{this.raf=requestAnimationFrame(tick);if(now-this.previousSample<30||!this.analyser||!this.data)return;this.previousSample=now;this.analyser.getByteFrequencyData(this.data);const mean=(lo:number,hi:number)=>{let total=0;for(let i=lo;i<hi;i++)total+=this.data![i];return total/((hi-lo)*255)};const bass=mean(1,6),mids=mean(6,48),highs=mean(48,180);const m=this.metrics;m.bass+=(bass-m.bass)*.24;m.mids+=(mids-m.mids)*.22;m.highs+=(highs-m.highs)*.22;m.energy+=((bass*.35+mids*.5+highs*.15)-m.energy)*.18;this.averageBass+=(bass-this.averageBass)*.045;m.bassHit=bass>.32&&bass>this.averageBass*1.15&&now-m.beatAt>DEVICE_CONFIG.jumpCooldown;if(m.bassHit)m.beatAt=now;for(let i=0;i<16;i++){const lo=Math.floor(1+Math.pow(i/16,1.8)*160),hi=Math.max(lo+1,Math.floor(1+Math.pow((i+1)/16,1.8)*160));m.bars[i]+=(mean(lo,hi)-m.bars[i])*.3}};this.raf=requestAnimationFrame(tick)}
  private stopAnalysis(){cancelAnimationFrame(this.raf);this.raf=0;Object.assign(this.metrics,{bass:0,mids:0,highs:0,energy:0,bassHit:false});this.metrics.bars.fill(0)}
}
export const audioEngine=new AudioEngine();
