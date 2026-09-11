import {createDogFrames} from './dogFrames';
import {createFrogFrames} from './pixelFrogFrames';
import {createCatFrames} from './catFrames';
export type CharacterState='idle'|'playing'|'dance'|'jump'|'excited'|'paused'|'sleep';
export const pets=[{id:'cat',label:'CAT'},{id:'dog',label:'DOG'},{id:'frog',label:'FROG'}] as const;
export type PetId=typeof pets[number]['id'];
export function isPetId(value:unknown):value is PetId{return pets.some(p=>p.id===value)}
export function createCharacterFrames(pet:PetId='cat'){
 return pet==='cat'?createCatFrames():pet==='dog'?createDogFrames():createFrogFrames();
}
