import type { AudioMetrics } from '../audio/AudioEngine';
import type { CharacterState } from './characterFrames';
import { DEVICE_CONFIG } from '../config';
export type ReactionMemory={state:CharacterState;until:number;lastBeat:number;lastExcited:number};
export function getCharacterReaction(metrics:AudioMetrics,playback:{playing:boolean;sleeping:boolean;hasPlayed:boolean},now:number,memory:ReactionMemory):CharacterState {
 if(playback.sleeping)return 'sleep';
 if(!playback.playing)return playback.hasPlayed?'paused':'idle';
 if(now<memory.until)return memory.state;
 if(metrics.energy>.7&&now-memory.lastExcited>DEVICE_CONFIG.excitedCooldown){memory.lastExcited=now;memory.state='excited';memory.until=now+500;return 'excited'}
 if(metrics.beatAt>memory.lastBeat&&now-metrics.beatAt<180){memory.lastBeat=metrics.beatAt;memory.state='jump';memory.until=now+300;return 'jump'}
 return metrics.energy>.38?'dance':'playing';
}
