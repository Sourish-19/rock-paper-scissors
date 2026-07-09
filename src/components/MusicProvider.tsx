import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

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
  const [player, setPlayer] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume, setSoundVolumeState] = useState(4);
  const [musicVolume, setMusicVolumeState] = useState(4);

  useEffect(() => {
    let active = true;
    let loadedPlayer: any = null;

    async function loadAudio() {
      try {
        // Safe require to prevent crashes if expo-audio is missing/incompatible
        const expoAudio = require('expo-audio');
        if (!expoAudio || !expoAudio.createAudioPlayer) {
          throw new Error('expo-audio is not available in this client');
        }

        const initialVol = isMuted ? 0 : (musicVolume * 0.1);
        
        // createAudioPlayer creates a new player instance from the asset
        const playerInstance = expoAudio.createAudioPlayer(
          require('../../assets/sounds/retro_bgm.wav')
        );

        playerInstance.isLooping = true;
        
        // Handle volume setting (which can be a property or a method)
        if (typeof playerInstance.setVolume === 'function') {
          playerInstance.setVolume(initialVol);
        } else {
          playerInstance.volume = initialVol;
        }

        if (active) {
          setPlayer(playerInstance);
          loadedPlayer = playerInstance;

          if (!isMuted && musicVolume > 0) {
            try {
              playerInstance.play();
            } catch (playError) {
              // Web autoplay block policy handler
              if (Platform.OS === 'web') {
                const resumeBGM = () => {
                  try {
                    if (loadedPlayer) {
                      loadedPlayer.play();
                    }
                  } catch (e) {
                    console.warn('Failed to play BGM on interaction:', e);
                  }
                  window.removeEventListener('click', resumeBGM);
                  window.removeEventListener('touchstart', resumeBGM);
                };
                window.addEventListener('click', resumeBGM);
                window.addEventListener('touchstart', resumeBGM);
              } else {
                console.warn('Failed to autoplay:', playError);
              }
            }
          }
        } else {
          if (typeof playerInstance.release === 'function') {
            playerInstance.release();
          }
        }
      } catch (error) {
        console.warn('Failed to load audio:', error);
      }
    }

    loadAudio();

    return () => {
      active = false;
      if (loadedPlayer) {
        try {
          loadedPlayer.pause();
          if (typeof loadedPlayer.release === 'function') {
            loadedPlayer.release();
          }
        } catch (e) {
          console.warn('Failed to release audio player:', e);
        }
      }
    };
  }, []);

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!player) return;
    try {
      const targetVol = newMuted ? 0 : (musicVolume * 0.1);
      if (typeof player.setVolume === 'function') {
        player.setVolume(targetVol);
      } else {
        player.volume = targetVol;
      }
      if (newMuted || musicVolume === 0) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.warn('Error toggling mute:', error);
    }
  };

  const setMusicVolume = async (vol: number) => {
    setMusicVolumeState(vol);
    if (!player) return;
    try {
      const targetVol = isMuted ? 0 : (vol * 0.1);
      if (typeof player.setVolume === 'function') {
        player.setVolume(targetVol);
      } else {
        player.volume = targetVol;
      }
      if (vol === 0 || isMuted) {
        player.pause();
      } else {
        player.play();
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
