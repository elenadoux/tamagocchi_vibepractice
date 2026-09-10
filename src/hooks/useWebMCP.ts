import { useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { tracks } from '../audio/tracks';
type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
export function useWebMCP(){useEffect(()=>{
 const context=(document as Document&{modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
 if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 const tools:Tool[]=[{name:'read_tama_player',description:'Read the local playlist and current playback state.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({tracks:tracks.map(({id,title,artist})=>({id,title,artist})),...audioEngine.getSnapshot()})},{name:'set_tama_volume',description:'Set the same player volume used by the LCD volume control. Does not start playback.',inputSchema:{type:'object',properties:{volume:{type:'number',minimum:0,maximum:1}},required:['volume'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input!=='object'||!('volume'in input)||typeof input.volume!=='number'||!Number.isFinite(input.volume)||input.volume<0||input.volume>1||Object.keys(input).length!==1)throw new Error('Expected { volume: number between 0 and 1 }');audioEngine.setVolume(input.volume);return{volume:audioEngine.getSnapshot().volume}}}];
 for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{/* Optional browser API. */}}
 return()=>lifecycle.abort();
 },[])}
