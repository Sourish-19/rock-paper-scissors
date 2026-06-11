import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface MusicContextType {
  isMuted: boolean;
  toggleMute: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);

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

        const { sound: playbackObject } = await Audio.Sound.createAsync(
          require('../../assets/sounds/retro_bgm.wav'),
          { shouldPlay: !isMuted, isLooping: true, volume: isMuted ? 0 : 0.5 }
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
      await sound.setVolumeAsync(newMuted ? 0 : 0.5);
      if (newMuted) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.warn('Error toggling mute:', error);
    }
  };

  return (
    <MusicContext.Provider value={{ isMuted, toggleMute }}>
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
