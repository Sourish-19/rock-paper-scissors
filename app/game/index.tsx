import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore, Choice, GameResult } from '@/store/gameStore';
import { CheckerboardBackground } from '@/components/CheckboardBackground';
import { RetroButton } from '@/components/RetroButton';

export default function GameScreen() {
  const router = useRouter();
  const { matchState, makeChoice, resetMatch, resetScore, incrementStreak, resetStreak } = useGameStore();
  const { userScore, computerScore, result, computerChoice, userChoice } = matchState;

  const [phase, setPhase] = useState<'selecting' | 'counting' | 'outcome'>('selecting');
  const [countdown, setCountdown] = useState<3 | 2 | 1 | 'SHOOT'>(3);
  const [pendingChoice, setPendingChoice] = useState<Choice>(null);
  const [roundHistory, setRoundHistory] = useState<GameResult[]>([]);

  // Animations
  const shakePlayerY = useRef(new Animated.Value(0)).current;
  const shakeBotY = useRef(new Animated.Value(0)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  // Initialize game on mount
  useEffect(() => {
    resetScore();
    resetMatch();
    setRoundHistory([]);
  }, []);

  // Animate hands shaking during countdown
  const startShaking = () => {
    shakePlayerY.setValue(0);
    shakeBotY.setValue(0);

    const shakeSequence = (anim: Animated.Value) => 
      Animated.sequence([
        Animated.timing(anim, { toValue: -15, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 15, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]);

    // Play shake sequence 4 times (total 1.6s)
    Animated.loop(
      Animated.parallel([
        shakeSequence(shakePlayerY),
        shakeSequence(shakeBotY),
      ]),
      { iterations: 4 }
    ).start();
  };

  // Run countdown sequence
  const playRound = (choice: 'rock' | 'paper' | 'scissors') => {
    setPendingChoice(choice);
    setPhase('counting');
    setCountdown(3);
    countdownScale.setValue(0.5);
    
    // Animate first count
    Animated.spring(countdownScale, { toValue: 1.5, friction: 4, useNativeDriver: true }).start();
    startShaking();

    // 2
    setTimeout(() => {
      setCountdown(2);
      countdownScale.setValue(0.5);
      Animated.spring(countdownScale, { toValue: 1.5, friction: 4, useNativeDriver: true }).start();
    }, 600);

    // 1
    setTimeout(() => {
      setCountdown(1);
      countdownScale.setValue(0.5);
      Animated.spring(countdownScale, { toValue: 1.5, friction: 4, useNativeDriver: true }).start();
    }, 1200);

    // SHOOT
    setTimeout(() => {
      setCountdown('SHOOT');
      countdownScale.setValue(0.5);
      Animated.spring(countdownScale, { toValue: 2.0, friction: 4, useNativeDriver: true }).start();
      
      // Compute result in store
      makeChoice(choice);
    }, 1800);

    // Transition to Outcome Phase
    setTimeout(() => {
      setPhase('outcome');
      bannerScale.setValue(0);
      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 2400);
  };

  // Track round outcomes in history and check match end state
  useEffect(() => {
    if (phase === 'outcome' && result) {
      setRoundHistory((prev) => [...prev, result]);

      // Delay to check win/lose condition
      const checkScores = setTimeout(() => {
        if (userScore >= 3) {
          incrementStreak();
          router.replace('/game/victory');
        } else if (computerScore >= 3) {
          resetStreak();
          router.replace('/game/defeat');
        } else {
          // Continue to next round
          resetMatch();
          setPhase('selecting');
        }
      }, 2500);

      return () => clearTimeout(checkScores);
    }
  }, [phase, result]);

  const handleQuit = () => {
    resetScore();
    resetMatch();
    router.replace('/');
  };

  // Map choices to Emojis
  const getHandEmoji = (choice: Choice) => {
    if (!choice) return '✊'; // Default to closed fist
    if (choice === 'rock') return '✊';
    if (choice === 'paper') return '✋';
    if (choice === 'scissors') return '✌️';
    return '✊';
  };

  return (
    <CheckerboardBackground>
      <SafeAreaView style={styles.container}>
        {/* Header with Quit and Rounds */}
        <View style={styles.header}>
          <Pressable style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>QUIT</Text>
          </Pressable>

          {/* Round Score Indicators (5 rounds maximum) */}
          <View style={styles.roundsRow}>
            {Array.from({ length: 5 }).map((_, index) => {
              const roundResult = roundHistory[index];
              let indicatorColor = '#FFFFFF';
              let indicatorText = '';

              if (roundResult === 'win') {
                indicatorColor = '#81C784'; // Green Check
                indicatorText = '✓';
              } else if (roundResult === 'lose') {
                indicatorColor = '#E57373'; // Red Cross
                indicatorText = '✗';
              } else if (roundResult === 'draw') {
                indicatorColor = '#B0BEC5'; // Gray Equal
                indicatorText = '=';
              }

              return (
                <View key={index} style={[styles.roundCircle, { backgroundColor: indicatorColor }]}>
                  <Text style={styles.roundCircleText}>{indicatorText}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Current Round Indicator Text */}
        <View style={styles.roundTitleContainer}>
          <Text style={styles.roundTitleText}>ROUND {roundHistory.length + 1}</Text>
        </View>

        {/* Battle Arena (Two Hand Gestures) */}
        <View style={styles.arena}>
          {/* Player Hand */}
          <View style={styles.gestureContainer}>
            <Text style={styles.gestureLabel}>YOU</Text>
            <Animated.View
              style={[
                styles.gestureBox,
                {
                  transform: [{ translateY: phase === 'counting' ? shakePlayerY : 0 }],
                  borderColor: '#000000',
                  backgroundColor: '#E0F7FA',
                },
              ]}
            >
              <Text style={styles.gestureEmoji}>
                {phase === 'counting' ? '✊' : getHandEmoji(userChoice)}
              </Text>
            </Animated.View>
            <Text style={styles.scoreText}>{userScore}</Text>
          </View>

          {/* VS Divider */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Bot Hand */}
          <View style={styles.gestureContainer}>
            <Text style={styles.gestureLabel}>BOT</Text>
            <Animated.View
              style={[
                styles.gestureBox,
                {
                  transform: [
                    { translateY: phase === 'counting' ? shakeBotY : 0 },
                    { scaleX: -1 }, // Flip bot hand horizontally
                  ],
                  borderColor: '#000000',
                  backgroundColor: '#FFEBEE',
                },
              ]}
            >
              <Text style={styles.gestureEmoji}>
                {phase === 'counting' ? '✊' : getHandEmoji(computerChoice)}
              </Text>
            </Animated.View>
            <Text style={styles.scoreText}>{computerScore}</Text>
          </View>
        </View>

        {/* Bottom Panel (Selection or Countdown/Outcome) */}
        <View style={styles.bottomPanel}>
          {phase === 'selecting' && (
            <View style={styles.selectingContainer}>
              <Text style={styles.selectingTitle}>CHOOSE WEAPON</Text>
              <View style={styles.choicesRow}>
                <Pressable style={styles.choiceCircle} onPress={() => playRound('rock')}>
                  <Text style={styles.choiceEmoji}>✊</Text>
                  <Text style={styles.choiceLabel}>ROCK</Text>
                </Pressable>

                <Pressable style={styles.choiceCircle} onPress={() => playRound('paper')}>
                  <Text style={styles.choiceEmoji}>✋</Text>
                  <Text style={styles.choiceLabel}>PAPER</Text>
                </Pressable>

                <Pressable style={styles.choiceCircle} onPress={() => playRound('scissors')}>
                  <Text style={styles.choiceEmoji}>✌️</Text>
                  <Text style={styles.choiceLabel}>SCISSORS</Text>
                </Pressable>
              </View>
            </View>
          )}

          {phase === 'counting' && (
            <View style={styles.countingContainer}>
              <Animated.Text
                style={[
                  styles.countdownText,
                  {
                    transform: [{ scale: countdownScale }],
                    color: countdown === 'SHOOT' ? '#FFDE4D' : '#FFFFFF',
                  },
                ]}
              >
                {countdown}
              </Animated.Text>
            </View>
          )}

          {phase === 'outcome' && (
            <Animated.View style={[styles.outcomeContainer, { transform: [{ scale: bannerScale }] }]}>
              <View style={styles.bannerBox}>
                <Text style={styles.bannerText}>
                  {result === 'win' && 'ONE POINT TO YOU!'}
                  {result === 'lose' && 'ONE POINT TO BOT!'}
                  {result === 'draw' && "IT'S A DRAW!"}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </CheckerboardBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  quitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
  },
  quitButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#FFFFFF',
  },
  roundsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roundCircle: {
    width: 28,
    height: 28,
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundCircleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  roundTitleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  roundTitleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    color: '#000000',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  arena: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureContainer: {
    alignItems: 'center',
    flex: 1,
  },
  gestureLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 12,
    color: '#000000',
    marginBottom: 8,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  gestureBox: {
    width: 100,
    height: 100,
    borderWidth: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
  },
  gestureEmoji: {
    fontSize: 50,
  },
  vsContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 18,
    color: '#FFDE4D',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  scoreText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 24,
    color: '#000000',
    marginTop: 12,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  bottomPanel: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  selectingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  selectingTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  choiceCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#FFDE4D',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  choiceEmoji: {
    fontSize: 32,
  },
  choiceLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#000000',
    marginTop: 2,
    textAlign: 'center',
  },
  countingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 32,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
  },
  outcomeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bannerBox: {
    backgroundColor: '#FFDE4D',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  bannerText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 11,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
  },
});
