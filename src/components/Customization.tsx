import {useState} from 'react';
export type Skin={id:string;name:string;color:string;button:string;material:string;shape?:string;buttons?:string};
export const skins:Skin[]=[
{id:'01',name:'Bubblegum',color:'#f39aba',button:'#fbaac5',material:'Jelly'},
{id:'02',name:'Milk',color:'#f5eedf',button:'#caba9e',material:'Gloss'},
{id:'03',name:'Glass',color:'#b6d3e4',button:'#d3e9ee',material:'Glass'},
{id:'04',name:'Night',color:'#292a2d',button:'#393a3c',material:'Matte',shape:'horns'},
{id:'05',name:'Chrome',color:'#d6dce1',button:'#363b40',material:'Metal'},
{id:'06',name:'Matcha',color:'#a9c36d',button:'#d4e59e',material:'Jelly',buttons:'pill'},
{id:'07',name:'Sweet',color:'#f4b4c2',button:'#f8c8d1',material:'Gloss',shape:'ears',buttons:'heart'},
{id:'08',name:'Sand',color:'#e4d3b8',button:'#c9b797',material:'Ceramic'},
{id:'09',name:'Retro',color:'#424843',button:'#c5e66f',material:'Jelly',buttons:'square'},
{id:'10',name:'Pearl',color:'#eee6f3',button:'#fff0da',material:'Pearl',buttons:'flower'},
{id:'12',name:'Cosmic',color:'#6b369e',button:'#d396e6',material:'Glass'}];
export function useCustomization(){
 const [skin,setSkin]=useState<Skin>(()=>{try{const saved=JSON.parse(localStorage.getItem('tama-skin')||'null');if(saved&&skins.some(s=>s.id===saved.id))return {...skins.find(s=>s.id===saved.id)!,...saved};}catch{}return skins[0]});
 return {skin,update:(next:Skin)=>{setSkin(next);try{localStorage.setItem('tama-skin',JSON.stringify(next))}catch{}}};
}
export function Customization({skin,update}:{skin:Skin;update:(s:Skin)=>void}){
 return <aside className="customization" aria-label="Device customization"><div className="custom-kicker">MAKE IT YOURS</div><h2>Your little world.</h2><p>A new look. Same little companion.</p><div className="skin-grid">{skins.map(s=><button key={s.id} className={skin.id===s.id?'skin-option selected':'skin-option'} aria-pressed={skin.id===s.id} onClick={()=>update(s)}><span className="skin-swatch" style={{background:s.color,borderRadius:s.buttons==='square'?'8px':'50% 50% 42% 42%'}}/><span><small>{s.id}</small> {s.name}</span></button>)}</div><label className="custom-field">Material<select value={skin.material} onChange={e=>update({...skin,material:e.target.value})}>{['Jelly','Gloss','Glass','Matte','Metal','Ceramic','Pearl'].map(m=><option key={m}>{m}</option>)}</select></label><label className="custom-field">Shell color<input type="color" value={skin.color} onChange={e=>update({...skin,color:e.target.value})}/></label><button className="skin-reset" onClick={()=>update(skins.find(s=>s.id===skin.id)!)}>Reset this look ↺</button></aside>
}
