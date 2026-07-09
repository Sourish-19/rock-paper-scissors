import React from 'react';
import { StyleSheet, View, SafeAreaView, Pressable, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { PixelText } from '@/components/PixelText';

const ModeButton = ({ onPress, title }: any) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.modeBtnContainer,
      pressed && { transform: [{ translateY: 4 }] }
    ]}>
      <ImageBackground
        source={require('../assets/game_mode_screen/button.png')}
        style={styles.modeBtnBg}
        resizeMode="stretch"
      >
        <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.modeBtnText}>
          {title}
        </PixelText>
      </ImageBackground>
    </Pressable>
  );
};

export default function GameModeScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const { setMaxRounds } = useGameStore();

  const handleSelectMode = (rounds: number) => {
    setMaxRounds(rounds);
    if (mode === 'multi') {
      router.push('/online-lobby' as any);
    } else {
      router.push('/game');
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/game_mode_screen/Sky.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Background Clouds */}
        <Image 
          source={require('../assets/game_mode_screen/cloud_1.png')} 
          style={[styles.cloud, { top: '8%', left: -30, width: 160, height: 75 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/game_mode_screen/cloud_2.png')} 
          style={[styles.cloud, { top: '5%', right: -15, width: 120, height: 60 }]} 
          contentFit="contain" 
        />

        {/* Floating game elements */}
        <Image 
          source={require('../assets/game_mode_screen/Paper.png')} 
          style={[styles.floatingElement, { top: '16%', left: '10%', width: 55, height: 55 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/game_mode_screen/Scissors.png')} 
          style={[styles.floatingElement, { top: '13%', right: '8%', width: 55, height: 55 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/game_mode_screen/Stone.png')} 
          style={[styles.floatingElement, { bottom: '15%', right: '12%', width: 85, height: 68 }]} 
          contentFit="contain" 
        />

        <View style={styles.container}>
          {/* Header Card */}
          <View style={styles.titleContainer}>
            <Image
              source={require('../assets/game_mode_screen/select_game_mode.png')}
              style={styles.headerImage}
              contentFit="contain"
            />
          </View>

          {/* Mode Selection Buttons */}
          <View style={styles.buttonsContainer}>
            <ModeButton
              title="BEST OF 3"
              onPress={() => handleSelectMode(3)}
            />
            <ModeButton
              title="BEST OF 5"
              onPress={() => handleSelectMode(5)}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  cloud: {
    position: 'absolute',
    opacity: 0.8,
  },
  floatingElement: {
    position: 'absolute',
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 65,
    zIndex: 2,
  },
  headerImage: {
    width: 280,
    height: 166,
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 40,
    zIndex: 2,
  },
  modeBtnContainer: {
    width: 280,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modeBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBtnText: {
    fontSize: 14,
  },
});
