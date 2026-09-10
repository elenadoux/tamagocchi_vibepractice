import { useSyncExternalStore } from 'react';
import { audioEngine } from '../audio/AudioEngine';
export function useAudio(){return useSyncExternalStore(audioEngine.subscribe,audioEngine.getSnapshot)}
