import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

export default function GameModeScreen() {
  const router = useRouter();
  const { setMaxRounds } = useGameStore();

  const handleSelectMode = (rounds: number) => {
    setMaxRounds(rounds);
    router.push('/game');
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <PixelText style={styles.titleText} strokeColor="#000000" fillColor="#FFFFFF">
            CHOOSE{'\n'}YOUR{'\n'}BATTLE
          </PixelText>
        </View>

        <View style={styles.buttonsContainer}>
          <RetroButton
            title="BEST OF 3"
            onPress={() => handleSelectMode(3)}
            backgroundColor="#FFDE4D"
          />
          <View style={{ height: 20 }} />
          <RetroButton
            title="BEST OF 5"
            onPress={() => handleSelectMode(5)}
            backgroundColor="#FFDE4D"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#4DB8FF',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  titleText: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 40,
  },
});
