import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { CheckerboardBackground } from '@/components/CheckboardBackground';
import { RetroButton } from '@/components/RetroButton';

export default function DefeatScreen() {
  const router = useRouter();
  const { matchState, winStreak, resetScore, resetMatch } = useGameStore();
  const { userScore, computerScore } = matchState;

  const [shareStatus, setShareStatus] = useState('');

  // Animations
  const sway1Anim = useRef(new Animated.Value(0)).current;
  const sway2Anim = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Swaying animations for balloons
    const createSway = (anim: Animated.Value, toDeg: string, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -1,
            duration: duration * 1.2,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createSway(sway1Anim, '8deg', 1800).start();
    createSway(sway2Anim, '-10deg', 2200).start();

    // Pulse title slowly (breathing effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(textScale, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(textScale, { toValue: 0.97, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTryAgain = () => {
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
        message: `I played a tough match in Retro Rock Paper Scissors but lost! 😢 Score: ${userScore}-${computerScore}. My streak is reset. Can you avenge me?`,
      });
      if (result.action === Share.sharedAction) {
        setShareStatus('SHARED SUCCESSFULLY!');
        setTimeout(() => setShareStatus(''), 2000);
      }
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  // Sway rotation interpolation
  const rotateSway1 = sway1Anim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-8deg', '8deg'],
  });

  const rotateSway2 = sway2Anim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-12deg', '12deg'],
  });

  return (
    <CheckerboardBackground>
      <SafeAreaView style={styles.container}>
        {/* Defeat Header */}
        <Animated.View style={[styles.titleContainer, { transform: [{ scale: textScale }] }]}>
          <Text style={styles.titleShadow}>DEFEAT...</Text>
          <Text style={styles.titleText}>DEFEAT...</Text>
        </Animated.View>

        {/* Stats Section */}
        <View style={styles.statsBox}>
          <Text style={styles.scoreTitle}>FINAL SCORE</Text>
          <Text style={styles.scoreText}>{userScore} : {computerScore}</Text>
          <Text style={styles.streakText}>STREAK: 0 MATCHES</Text>
        </View>

        {/* Character on Cracked Pillar with Balloons */}
        <View style={styles.sceneSection}>
          {/* Balloon 1 (Red) */}
          <Animated.View style={[styles.balloonContainer, styles.balloonLeft, { transform: [{ rotate: rotateSway1 }] }]}>
            <View style={[styles.balloonFace, { backgroundColor: '#EF5350' }]} />
            <View style={styles.balloonTie} />
            <View style={styles.balloonString} />
          </Animated.View>

          {/* Balloon 2 (Blue) */}
          <Animated.View style={[styles.balloonContainer, styles.balloonRight, { transform: [{ rotate: rotateSway2 }] }]}>
            <View style={[styles.balloonFace, { backgroundColor: '#42A5F5' }]} />
            <View style={styles.balloonTie} />
            <View style={styles.balloonString} />
          </Animated.View>

          {/* Sad Character (Frowning mouth, tilted head) */}
          <View style={styles.characterContainer}>
            <View style={styles.hair} />
            <View style={styles.face}>
              <View style={styles.sunglasses} />
              <View style={styles.sadMouth} />
            </View>
            <View style={styles.shirt} />
          </View>

          {/* Cracked Pillar */}
          <View style={styles.pillar}>
            {/* Pillar Top */}
            <View style={styles.pillarTop} />
            {/* Pillar Trunk with Cracks */}
            <View style={styles.pillarTrunk}>
              {/* Diagonal crack line 1 */}
              <View style={[styles.crack, { top: 8, left: 12, width: 2, height: 16, transform: [{ rotate: '25deg' }] }]} />
              {/* Diagonal crack line 2 */}
              <View style={[styles.crack, { top: 20, left: 16, width: 2, height: 10, transform: [{ rotate: '-35deg' }] }]} />
              {/* Diagonal crack line 3 */}
              <View style={[styles.crack, { top: 14, left: 30, width: 2, height: 12, transform: [{ rotate: '40deg' }] }]} />
            </View>
            {/* Pillar Base */}
            <View style={styles.pillarBottom} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {shareStatus ? (
            <Text style={styles.shareStatusText}>{shareStatus}</Text>
          ) : null}

          <RetroButton
            title="TRY AGAIN"
            onPress={handleTryAgain}
            backgroundColor="#FFDE4D"
          />
          <View style={{ height: 12 }} />
          <RetroButton
            title="SHARE LOSS"
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
    color: '#FF6B6B', // Red/Crimson
    textShadowColor: '#B71C1C',
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
    color: '#FF5252',
  },
  sceneSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    width: 200,
    position: 'relative',
    marginTop: 20,
  },
  balloonContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 30,
    height: 60,
  },
  balloonLeft: {
    left: 10,
    top: 0,
  },
  balloonRight: {
    right: 15,
    top: 15,
  },
  balloonFace: {
    width: 22,
    height: 26,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#000000',
  },
  balloonTie: {
    width: 4,
    height: 4,
    backgroundColor: '#000000',
    marginTop: -1,
  },
  balloonString: {
    width: 1.5,
    height: 30,
    backgroundColor: '#000000',
  },
  characterContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: -6,
    transform: [{ rotate: '4deg' }], // Slightly tilted head in sadness
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
    opacity: 0.8,
  },
  sadMouth: {
    width: 12,
    height: 4,
    borderTopWidth: 2,
    borderTopColor: '#000000',
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
    borderRightWidth: 2,
    borderRightColor: 'transparent',
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
  pillar: {
    alignItems: 'center',
    width: 120,
  },
  pillarTop: {
    width: 66,
    height: 8,
    backgroundColor: '#CFD8DC',
    borderWidth: 3,
    borderColor: '#000000',
  },
  pillarTrunk: {
    width: 46,
    height: 40,
    backgroundColor: '#B0BEC5',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000000',
    position: 'relative',
  },
  crack: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  pillarBottom: {
    width: 76,
    height: 10,
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
