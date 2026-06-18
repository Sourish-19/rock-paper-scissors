import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { PixelText } from '@/components/PixelText';

export default function LoadingScreen() {
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 2500,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        router.replace('/onboarding');
      }
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Image 
            source={require('../assets/images/characters/char_avatar_idle.png')} 
            style={styles.character} 
            contentFit="contain" 
          />
          <PixelText style={styles.loadingText}>LOADING...</PixelText>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    width: '80%',
  },
  character: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  progressBarContainer: {
    width: '100%',
    height: 24,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFDE4D',
  },
});
