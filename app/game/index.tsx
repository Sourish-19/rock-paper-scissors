import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore, Choice, GameResult } from '@/store/gameStore';
import { CheckerboardBackground } from '@/components/CheckboardBackground';
import { PixelText } from '@/components/PixelText';

export default function GameScreen() {
  const router = useRouter();
  const { matchState, makeChoice, resetMatch, resetScore, incrementStreak, resetStreak, userProfile } = useGameStore();
  const { userScore, computerScore, result, computerChoice, userChoice, round } = matchState;

  const [phase, setPhase] = useState<'selecting' | 'counting' | 'outcome'>('selecting');
  const [countdown, setCountdown] = useState<3 | 2 | 1 | 'SHOOT'>(3);
  const [roundHistory, setRoundHistory] = useState<{userResult: GameResult, botResult: GameResult}[]>([]);

  // Animations
  const shakePlayerY = useRef(new Animated.Value(0)).current;
  const shakeBotY = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    resetScore();
    resetMatch();
    setRoundHistory([]);
  }, []);

  const startShaking = () => {
    shakePlayerY.setValue(0);
    shakeBotY.setValue(0);
    const shakeSequence = (anim: Animated.Value, isBot: boolean) => 
      Animated.sequence([
        Animated.timing(anim, { toValue: isBot ? 15 : -15, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: isBot ? -15 : 15, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]);

    Animated.loop(
      Animated.parallel([
        shakeSequence(shakePlayerY, false),
        shakeSequence(shakeBotY, true),
      ]),
      { iterations: 4 }
    ).start();
  };

  const playRound = (choice: 'rock' | 'paper' | 'scissors') => {
    setPhase('counting');
    setCountdown(3);
    countdownScale.setValue(0.5);
    Animated.spring(countdownScale, { toValue: 1.5, friction: 4, useNativeDriver: true }).start();
    startShaking();

    setTimeout(() => {
      setCountdown(2);
      countdownScale.setValue(0.5);
      Animated.spring(countdownScale, { toValue: 1.5, friction: 4, useNativeDriver: true }).start();
    }, 600);

    setTimeout(() => {
      setCountdown(1);
      countdownScale.setValue(0.5);
      Animated.spring(countdownScale, { toValue: 1.5, friction: 4, useNativeDriver: true }).start();
    }, 1200);

    setTimeout(() => {
      setCountdown('SHOOT');
      countdownScale.setValue(0.5);
      Animated.spring(countdownScale, { toValue: 2.0, friction: 4, useNativeDriver: true }).start();
      makeChoice(choice);
    }, 1800);

    setTimeout(() => {
      setPhase('outcome');
    }, 2400);
  };

  useEffect(() => {
    if (phase === 'outcome' && result) {
      setRoundHistory(prev => [...prev, { 
        userResult: result, 
        botResult: result === 'win' ? 'lose' : result === 'lose' ? 'win' : 'draw' 
      }]);

      const checkScores = setTimeout(() => {
        // Evaluate overall winner if 3 rounds are completed. Note: `round` is incremented after makeChoice.
        // If we just completed round 3, `round` is now 4 in the store.
        if (round > 3) {
          if (userScore > computerScore) {
            incrementStreak();
            router.replace('/game/victory');
          } else if (computerScore > userScore) {
            resetStreak();
            router.replace('/game/defeat');
          } else {
            router.replace('/game/draw');
          }
        } else {
          resetMatch();
          setPhase('selecting');
        }
      }, 2500);

      return () => clearTimeout(checkScores);
    }
  }, [phase, result]);

  const getHandSource = (isBot: boolean, choice: Choice, currentPhase: string) => {
    if (currentPhase === 'counting' || currentPhase === 'selecting') {
      return isBot ? require('../../assets/images/hands/hand_bot_rock.png') : require('../../assets/images/hands/hand_player_rock.png');
    }
    const c = choice || 'rock';
    if (isBot) {
      if (c === 'rock') return require('../../assets/images/hands/hand_bot_rock.png');
      if (c === 'paper') return require('../../assets/images/hands/hand_bot_paper.png');
      if (c === 'scissors') return require('../../assets/images/hands/hand_bot_scissors.png');
    } else {
      if (c === 'rock') return require('../../assets/images/hands/hand_player_rock.png');
      if (c === 'paper') return require('../../assets/images/hands/hand_player_paper.png');
      if (c === 'scissors') return require('../../assets/images/hands/hand_player_scissors.png');
    }
  };

  return (
    <CheckerboardBackground>
      <SafeAreaView style={styles.container}>
        
        {/* BOT side indicators */}
        <View style={styles.botIndicators}>
          {Array.from({ length: 3 }).map((_, i) => {
             const res = roundHistory[i]?.botResult;
             let color = 'transparent';
             let text = '';
             if (res === 'win') { color = '#4CAF50'; text = '✓'; }
             if (res === 'lose') { color = '#E53935'; text = '✗'; }
             return (
               <View key={i} style={[styles.indicatorCircle, { backgroundColor: color }]}>
                 {text ? <Text style={styles.indicatorText}>{text}</Text> : null}
               </View>
             );
          })}
        </View>

        {/* PLAYER side indicators */}
        <View style={styles.playerIndicators}>
          {Array.from({ length: 3 }).map((_, i) => {
             const res = roundHistory[i]?.userResult;
             let color = 'transparent';
             let text = '';
             if (res === 'win') { color = '#4CAF50'; text = '✓'; }
             if (res === 'lose') { color = '#E53935'; text = '✗'; }
             return (
               <View key={i} style={[styles.indicatorCircle, { backgroundColor: color }]}>
                 {text ? <Text style={styles.indicatorText}>{text}</Text> : null}
               </View>
             );
          })}
        </View>

        <View style={styles.botNameContainer}>
          <PixelText style={styles.nameText}>BOT</PixelText>
        </View>
        
        <View style={styles.playerNameContainer}>
          <PixelText style={styles.nameText}>{userProfile?.username?.toUpperCase() || 'SOU'}</PixelText>
        </View>

        <View style={styles.arena}>
          <Animated.View style={[styles.botHandContainer, { transform: [{ translateY: shakeBotY }] }]}>
            <Image source={getHandSource(true, computerChoice, phase)} style={styles.handImageTop} contentFit="contain" />
          </Animated.View>

          {phase === 'counting' && (
            <Animated.View style={[styles.centerTextContainer, { transform: [{ scale: countdownScale }] }]}>
              <PixelText style={styles.countdownText} fillColor="#FFFFFF" strokeColor="#000000">
                {countdown}
              </PixelText>
            </Animated.View>
          )}

          <Animated.View style={[styles.playerHandContainer, { transform: [{ translateY: shakePlayerY }] }]}>
            <Image source={getHandSource(false, userChoice, phase)} style={styles.handImageBottom} contentFit="contain" />
          </Animated.View>
        </View>

        {phase === 'selecting' && (
          <View style={styles.choicesRow}>
            <Pressable onPress={() => playRound('rock')}>
              <Image source={require('../../assets/images/buttons/btn_rock.png')} style={styles.choiceBtn} />
            </Pressable>
            <Pressable onPress={() => playRound('paper')}>
              <Image source={require('../../assets/images/buttons/btn_paper.png')} style={styles.choiceBtn} />
            </Pressable>
            <Pressable onPress={() => playRound('scissors')}>
              <Image source={require('../../assets/images/buttons/btn_scissors.png')} style={styles.choiceBtn} />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </CheckerboardBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  botIndicators: { position: 'absolute', left: 24, top: '25%', gap: 12, zIndex: 10 },
  playerIndicators: { position: 'absolute', right: 24, bottom: '25%', gap: 12, zIndex: 10 },
  indicatorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 4, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  indicatorText: { fontFamily: 'PressStart2P_400Regular', fontSize: 12, color: '#000' },
  botNameContainer: { position: 'absolute', top: 40, left: 24, zIndex: 10 },
  playerNameContainer: { position: 'absolute', bottom: 120, right: 24, zIndex: 10 },
  nameText: { fontSize: 24 },
  arena: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  botHandContainer: { position: 'absolute', top: -50, width: '100%', alignItems: 'center' },
  playerHandContainer: { position: 'absolute', bottom: -50, width: '100%', alignItems: 'center' },
  handImageTop: { width: 350, height: 400 },
  handImageBottom: { width: 350, height: 400 },
  centerTextContainer: { position: 'absolute', top: '45%', zIndex: 20 },
  countdownText: { fontSize: 64 },
  choicesRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingBottom: 20, position: 'absolute', bottom: 20, width: '100%', zIndex: 30 },
  choiceBtn: { width: 90, height: 90 },
});
