import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface MusicContextType {
  isMuted: boolean;
  toggleMute: () => Promise<void>;
  soundVolume: number;
  musicVolume: number;
  setSoundVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume, setSoundVolumeState] = useState(4);
  const [musicVolume, setMusicVolumeState] = useState(4);

  useEffect(() => {
    let active = true;
    let loadedSound: Audio.Sound | null = null;

    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });

        const initialVol = isMuted ? 0 : (musicVolume * 0.1);
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          require('../../assets/sounds/retro_bgm.wav'),
          { shouldPlay: !isMuted && musicVolume > 0, isLooping: true, volume: initialVol }
        );

        if (active) {
          setSound(playbackObject);
          loadedSound = playbackObject;
        } else {
          await playbackObject.unloadAsync();
        }
      } catch (error) {
        console.warn('Failed to load audio:', error);
      }
    }

    loadAudio();

    return () => {
      active = false;
      if (loadedSound) {
        loadedSound.unloadAsync();
      }
    };
  }, []);

  const toggleMute = async () => {
    if (!sound) return;
    try {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      const targetVol = newMuted ? 0 : (musicVolume * 0.1);
      await sound.setVolumeAsync(targetVol);
      if (newMuted || musicVolume === 0) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.warn('Error toggling mute:', error);
    }
  };

  const setMusicVolume = async (vol: number) => {
    setMusicVolumeState(vol);
    if (!sound) return;
    try {
      const targetVol = isMuted ? 0 : (vol * 0.1);
      await sound.setVolumeAsync(targetVol);
      if (vol === 0 || isMuted) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.warn('Error setting music volume:', error);
    }
  };

  const setSoundVolume = (vol: number) => {
    setSoundVolumeState(vol);
  };

  return (
    <MusicContext.Provider value={{ isMuted, toggleMute, soundVolume, musicVolume, setSoundVolume, setMusicVolume }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
