import { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine, readLocal, saveLocal } from '../audio/AudioEngine';
import { tracks } from '../audio/tracks';
import type { VisualMode } from '../character/PixelCharacter';
import { pets, isPetId, type PetId } from '../character/characterFrames';
import { DEVICE_CONFIG } from '../config';
export type Screen='home'|'menu'|'music'|'favorites'|'pet'|'visual'|'settings'|'volume'|'contrast'|'about'|'details';
export const menuItems=[{screen:'music',label:'MUSIC',icon:'music'},{screen:'favorites',label:'FAVS',icon:'heart'},{screen:'pet',label:'PETS',icon:'pet'},{screen:'visual',label:'VISUAL',icon:'bars'},{screen:'settings',label:'SETTINGS',icon:'settings'}] as const;
export function usePlayerUI(playing:boolean){
 const [selectedPet,setSelectedPet]=useState<PetId>(()=>{const saved=readLocal<unknown>('tama-pet','cat');return isPetId(saved)?saved:'cat'});
 const [screen,setScreen]=useState<Screen>('home');const [selection,setSelection]=useState(0);const [mode,setMode]=useState<VisualMode>('PET');const [sleeping,setSleeping]=useState(false);const [booting,setBooting]=useState(true);
 const [favorites,setFavorites]=useState<string[]>(()=>{const f=readLocal<unknown>('tama-favorites',[]);return Array.isArray(f)?f.filter(x=>typeof x==='string'&&tracks.some(t=>t.id===x)):[]});
 const [contrast,setContrast]=useState(()=>readLocal<boolean>('tama-contrast',false)===true);const lastInteraction=useRef(Date.now());
 const wake=useCallback(()=>{lastInteraction.current=Date.now();setSleeping(false)},[]);
 useEffect(()=>{const timer=setTimeout(()=>setBooting(false),1250);return()=>clearTimeout(timer)},[]);
 useEffect(()=>{const interval=setInterval(()=>{if(!playing&&Date.now()-lastInteraction.current>DEVICE_CONFIG.sleepMs){setSleeping(true);setScreen('home')}},1000);window.addEventListener('pointerdown',wake);window.addEventListener('pointermove',wake);window.addEventListener('keydown',wake);return()=>{clearInterval(interval);window.removeEventListener('pointerdown',wake);window.removeEventListener('pointermove',wake);window.removeEventListener('keydown',wake)}},[playing,wake]);
 const open=useCallback((next:Screen)=>{wake();setScreen(next);setSelection(next==='pet'?pets.findIndex(p=>p.id===selectedPet):0)},[wake,selectedPet]);
 const toggleFavorite=()=>{const id=tracks[audioEngine.getSnapshot().currentTrackIndex]?.id;if(!id)return;setFavorites(f=>{const next=f.includes(id)?f.filter(x=>x!==id):[...f,id];saveLocal('tama-favorites',next);return next})};
 const favoriteTracks=tracks.filter(t=>favorites.includes(t.id));
 const back=()=>open(['volume','contrast','about'].includes(screen)?'settings':screen==='menu'||screen==='details'?'home':'menu');
 const choose=(index=selection)=>{wake();switch(screen){
  case 'home':audioEngine.toggle();break;
  case 'menu':open(menuItems[index].screen);break;
  case 'music':if(tracks[index]){audioEngine.select(index,true);open('home')}break;
  case 'favorites':if(index===0)toggleFavorite();else if(favoriteTracks[index-1]){audioEngine.select(tracks.indexOf(favoriteTracks[index-1]),true);open('home')}break;
  case 'visual':setMode((['PET','BARS','WAVE'] as VisualMode[])[index]);open('home');break;
  case 'settings':open((['volume','contrast','about'] as Screen[])[index]);break;
  case 'volume':case 'contrast':case 'about':back();break;
  case 'pet':if(pets[index]){setSelectedPet(pets[index].id);saveLocal('tama-pet',pets[index].id);open('home')}break;
  case 'details':audioEngine.toggle();break;
 }};
 const left=()=>{wake();if(screen==='home'||screen==='details'){audioEngine.previous();return}if(screen==='volume'){audioEngine.setVolume(Math.round(audioEngine.getSnapshot().volume*10)>=10?0:audioEngine.getSnapshot().volume+.1);return}if(screen==='contrast'){setContrast(v=>{saveLocal('tama-contrast',!v);return!v});return}const count=screen==='pet'?pets.length:screen==='menu'?menuItems.length:screen==='music'?tracks.length:screen==='favorites'?favoriteTracks.length+1:screen==='settings'||screen==='visual'?3:1;setSelection(i=>(i+1)%Math.max(1,count))};
 const right=()=>{wake();if(screen==='home')audioEngine.next();else back()};
 const actions=useRef({left,right,choose,back,open});actions.current={left,right,choose,back,open};
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.repeat||event.metaKey||event.ctrlKey||event.altKey)return;const target=event.target as HTMLElement;if(['INPUT','TEXTAREA','SELECT'].includes(target.tagName))return;const a=actions.current;switch(event.code){case 'Space':event.preventDefault();audioEngine.toggle();break;case 'ArrowLeft':event.preventDefault();a.left();break;case 'ArrowRight':event.preventDefault();a.right();break;case 'Enter':if(target.tagName!=='BUTTON'){event.preventDefault();a.choose()}break;case 'KeyM':event.preventDefault();a.open('menu');break;case 'Escape':event.preventDefault();a.back();break}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 return {selectedPet,screen,selection,setSelection,mode,sleeping,booting,favorites,favoriteTracks,contrast,setContrast,open,back,choose,left,right,wake,toggleFavorite};
}
export type PlayerUI=ReturnType<typeof usePlayerUI>;
