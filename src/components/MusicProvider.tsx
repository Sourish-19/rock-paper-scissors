import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

interface MusicContextType {
  isMuted: boolean;
  toggleMute: () => Promise<void>;
  soundVolume: number;
  musicVolume: number;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => Promise<void>;
}
const MusicContext = createContext<MusicContextType | undefined>(undefined);
export function MusicProvider({children}: {children: React.ReactNode}) {
  const player = useAudioPlayer(require('../../assets/sounds/retro_bgm.wav'));
  const [isMuted,setMuted] = useState(false);
  const [soundVolume,setSound] = useState(4);
  const [musicVolume,setMusic] = useState(4);
  useEffect(() => {
    // Expo Audio exposes mutable native player properties by design.
    // eslint-disable-next-line react-hooks/immutability
    player.loop = true;
    player.volume = isMuted ? 0 : musicVolume / 10;
    if (isMuted || !musicVolume) { player.pause(); return; }
    if (Platform.OS !== 'web') { player.play(); return; }
    // Start within a user gesture: browsers reject autoplay before interaction.
    const resume = () => { player.play(); };
    window.addEventListener('pointerdown',resume);
    window.addEventListener('keydown',resume);
    return () => { window.removeEventListener('pointerdown',resume); window.removeEventListener('keydown',resume); };
  },[player,isMuted,musicVolume]);
  return <MusicContext.Provider value={{isMuted,toggleMute:async()=>setMuted(v=>!v),soundVolume,musicVolume,setSoundVolume:v=>setSound(Math.max(0,Math.min(5,v))),setMusicVolume:async v=>setMusic(Math.max(0,Math.min(5,v)))}}>{children}</MusicContext.Provider>;
}
export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic requires MusicProvider');
  return context;
}
