import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { CheckerboardBackground } from '@/components/CheckboardBackground';
import { RetroButton } from '@/components/RetroButton';

export default function VictoryScreen() {
  const router = useRouter();
  const { matchState, winStreak, resetScore, resetMatch } = useGameStore();
  const { userScore, computerScore } = matchState;

  const [shareStatus, setShareStatus] = useState('');

  // Animations
  const star1Anim = useRef(new Animated.Value(0)).current;
  const star2Anim = useRef(new Animated.Value(0)).current;
  const star3Anim = useRef(new Animated.Value(0)).current;
  const textPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animations for stars
    const createFloat = (anim: Animated.Value, toVal: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: toVal, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );
    };

    createFloat(star1Anim, -15, 1200).start();
    createFloat(star2Anim, -25, 1600).start();
    createFloat(star3Anim, -10, 1000).start();

    // Pulse title
    Animated.loop(
      Animated.sequence([
        Animated.timing(textPulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(textPulse, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePlayAgain = () => {
    resetScore();
    resetMatch();
    router.replace('/game');
  };

  const handleGoHome = () => {
    resetScore();
    resetMatch();
    router.replace('/');
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `I just won a game of Retro Rock Paper Scissors! 🏆 Score: ${userScore}-${computerScore}. Current Streak: ${winStreak} wins! Can you beat me?`,
      });
      if (result.action === Share.sharedAction) {
        setShareStatus('SHARED SUCCESSFULLY!');
        setTimeout(() => setShareStatus(''), 2000);
      }
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <CheckerboardBackground>
      <SafeAreaView style={styles.container}>
        {/* Victory Header */}
        <Animated.View style={[styles.titleContainer, { transform: [{ scale: textPulse }] }]}>
          <Text style={styles.titleShadow}>VICTORY!</Text>
          <Text style={styles.titleText}>VICTORY!</Text>
        </Animated.View>

        {/* Stats Section */}
        <View style={styles.statsBox}>
          <Text style={styles.scoreTitle}>FINAL SCORE</Text>
          <Text style={styles.scoreText}>{userScore} : {computerScore}</Text>
          <Text style={styles.streakText}>STREAK: {winStreak} MATCHES</Text>
        </View>

        {/* Pedestal and Character Display */}
        <View style={styles.pedestalSection}>
          {/* Floating Stars */}
          <Animated.View style={[styles.star, styles.starLeft, { transform: [{ translateY: star1Anim }, { rotate: '45deg' }] }]} />
          <Animated.View style={[styles.star, styles.starRight, { transform: [{ translateY: star2Anim }, { rotate: '45deg' }] }]} />
          <Animated.View style={[styles.star, styles.starTop, { transform: [{ translateY: star3Anim }, { rotate: '45deg' }] }]} />

          {/* Idle Avatar (Winning Pose - Wearing sunglasses, bobbing up/down slightly) */}
          <View style={styles.characterContainer}>
            <View style={styles.hair} />
            <View style={styles.face}>
              <View style={styles.sunglasses} />
              <View style={styles.mouth} />
            </View>
            <View style={styles.shirt} />
          </View>

          {/* Pedestal (Grey retro blocks) */}
          <View style={styles.pedestal}>
            <View style={styles.pedestalTop} />
            <View style={styles.pedestalMiddle} />
            <View style={styles.pedestalBottom} />
          </View>
        </View>

        {/* Buttons Panel */}
        <View style={styles.buttonsContainer}>
          {shareStatus ? (
            <Text style={styles.shareStatusText}>{shareStatus}</Text>
          ) : null}

          <RetroButton
            title="PLAY AGAIN"
            onPress={handlePlayAgain}
            backgroundColor="#FFDE4D"
          />
          <View style={{ height: 12 }} />
          <RetroButton
            title="SHARE SCORE"
            onPress={handleShare}
            backgroundColor="#4DCEFF"
          />
          <View style={{ height: 12 }} />
          <RetroButton
            title="MAIN MENU"
            onPress={handleGoHome}
            backgroundColor="#FFFFFF"
          />
        </View>
      </SafeAreaView>
    </CheckerboardBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  titleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 32,
    color: '#FFDE4D', // Gold/Yellow
    textShadowColor: '#FF9F00',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textAlign: 'center',
  },
  titleShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 32,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
  },
  statsBox: {
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  scoreTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#666666',
    marginBottom: 8,
  },
  scoreText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 24,
    color: '#000000',
    marginBottom: 8,
  },
  streakText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#4CAF50',
  },
  pedestalSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: 200,
    position: 'relative',
    marginTop: 20,
  },
  star: {
    width: 14,
    height: 14,
    backgroundColor: '#FFEB3B',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#000000',
  },
  starLeft: {
    left: 30,
    top: 30,
  },
  starRight: {
    right: 30,
    top: 40,
  },
  starTop: {
    left: 90,
    top: 0,
  },
  characterContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: -6,
  },
  hair: {
    width: 36,
    height: 10,
    backgroundColor: '#3E2723',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 3,
    borderColor: '#000000',
  },
  face: {
    width: 42,
    height: 30,
    backgroundColor: '#FFCC80',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunglasses: {
    width: 32,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 2,
    position: 'absolute',
    top: 6,
  },
  mouth: {
    width: 10,
    height: 3,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 6,
  },
  shirt: {
    width: 32,
    height: 18,
    backgroundColor: '#29B6F6',
    borderWidth: 3,
    borderColor: '#000000',
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  pedestal: {
    alignItems: 'center',
    width: 120,
  },
  pedestalTop: {
    width: 70,
    height: 10,
    backgroundColor: '#CFD8DC',
    borderWidth: 3,
    borderColor: '#000000',
  },
  pedestalMiddle: {
    width: 90,
    height: 12,
    backgroundColor: '#B0BEC5',
    borderWidth: 3,
    borderColor: '#000000',
    borderTopWidth: 0,
  },
  pedestalBottom: {
    width: 110,
    height: 16,
    backgroundColor: '#90A4AE',
    borderWidth: 3,
    borderColor: '#000000',
    borderTopWidth: 0,
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  shareStatusText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
});
