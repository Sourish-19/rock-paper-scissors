import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { PixelText } from '@/components/PixelText';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start progress bar
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        router.replace('/onboarding');
      }
    });

    // Start floating animations
    const float = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -20,
            duration: 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    float(floatAnim1, 0);
    float(floatAnim2, 300);
    float(floatAnim3, 600);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground 
      source={require('../assets/loading_screen/Sky.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        {/* Clouds */}
        <Image 
          source={require('../assets/general/cloud_1.png')} 
          style={[styles.cloud, { top: height * 0.1, left: -20, width: 150, height: 80 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { top: height * 0.25, right: -10, width: 100, height: 60 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_1.png')} 
          style={[styles.cloud, { top: height * 0.6, left: 20, width: 120, height: 60, opacity: 0.8 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { bottom: height * 0.2, right: 30, width: 140, height: 70, opacity: 0.9 }]} 
          contentFit="contain" 
        />

        <View style={styles.centerContainer}>
          <View style={styles.iconsContainer}>
            <Animated.View style={{ transform: [{ translateY: floatAnim1 }] }}>
              <Image 
                source={require('../assets/loading_screen/Stone.png')} 
                style={styles.icon} 
                contentFit="contain" 
              />
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: floatAnim2 }] }}>
              <Image 
                source={require('../assets/loading_screen/Paper.png')} 
                style={styles.icon} 
                contentFit="contain" 
              />
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: floatAnim3 }] }}>
              <Image 
                source={require('../assets/loading_screen/Scissors.png')} 
                style={styles.icon} 
                contentFit="contain" 
              />
            </Animated.View>
          </View>

          <PixelText style={styles.loadingText} fillColor="#FFFFFF" strokeColor="#000000">
            LOADING...
          </PixelText>

          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloud: {
    position: 'absolute',
  },
  centerContainer: {
    alignItems: 'center',
    width: '80%',
    zIndex: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 60,
  },
  icon: {
    width: 60,
    height: 60,
  },
  loadingText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
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
