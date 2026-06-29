import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable, ImageBackground, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore, Choice, GameResult } from '@/store/gameStore';
import { PixelText } from '@/components/PixelText';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const { matchState, makeChoice, resetMatch, resetScore, incrementStreak, resetStreak, userProfile } = useGameStore();
  const { userScore, computerScore, result, computerChoice, userChoice, round } = matchState;

  const [phase, setPhase] = useState<'selecting' | 'counting' | 'outcome'>('selecting');
  const [countdown, setCountdown] = useState<3 | 2 | 1 | 'SHOOT' | ''>(3);
  const [roundHistory, setRoundHistory] = useState<{userResult: GameResult, botResult: GameResult}[]>([]);
  const [isAutoplay, setIsAutoplay] = useState(false);

  // Animations
  const shakePlayerY = useRef(new Animated.Value(0)).current;
  const shakeBotY = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    resetScore();
    resetMatch();
    setRoundHistory([]);
  }, []);

  useEffect(() => {
    if (isAutoplay && phase === 'selecting') {
      const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
      const timer = setTimeout(() => {
        const randomChoice = choices[Math.floor(Math.random() * choices.length)];
        playRound(randomChoice);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoplay, phase]);

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
      
      // Hide the SHOOT text after 1 second so you only see the hands clearly for the rest of the delay
      setTimeout(() => {
        setCountdown('');
      }, 1000);
    }, 1800);

    setTimeout(() => {
      setPhase('outcome');
    }, 3800);
  };

  useEffect(() => {
    if (phase === 'outcome' && result) {
      setRoundHistory(prev => [...prev, { 
        userResult: result, 
        botResult: result === 'win' ? 'lose' : result === 'lose' ? 'win' : 'draw' 
      }]);

      const checkScores = setTimeout(() => {
        const targetWins = Math.ceil(matchState.maxRounds / 2);
        if (userScore >= targetWins || computerScore >= targetWins || round > matchState.maxRounds) {
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

  const getHandSource = (isBot: boolean, choice: Choice) => {
    if (!choice) {
      return isBot 
        ? require('../../assets/game_screen/HOLD STATE REDHANDS BLOCK.png') 
        : require('../../assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png');
    }
    const c = choice;
    if (isBot) {
      if (c === 'rock') return require('../../assets/game_screen/ROCK RED HAND BLOCKS.png');
      if (c === 'paper') return require('../../assets/game_screen/PAPER RED HAND BLOCKS.png');
      if (c === 'scissors') return require('../../assets/game_screen/SCISSOR RED HAND BLOCKS.png');
    } else {
      if (c === 'rock') return require('../../assets/game_screen/ROCK BLUE HAND BLOCKS.png');
      if (c === 'paper') return require('../../assets/game_screen/PAPER BLUE HAND BLOCKS.png');
      if (c === 'scissors') return require('../../assets/game_screen/SCISSOR BLUE HAND BLOCKS.png');
    }
  };

  const getHandStyle = (choice: Choice) => {
    const gesture = choice || 'rock';
    let widthVal = 140;
    let heightVal = 240;
    
    if (gesture === 'rock') {
      heightVal = widthVal * (1276 / 752); // ~237px
    } else if (gesture === 'paper') {
      heightVal = widthVal * (1540 / 708); // ~304px
    } else if (gesture === 'scissors') {
      heightVal = widthVal * (1540 / 748); // ~288px
    }
    
    return {
      width: widthVal,
      height: heightVal,
    };
  };

  return (
    <ImageBackground 
      source={require('../../assets/game_screen/grass_Background.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        
        {/* Settings/Exit Trigger */}
        <Pressable 
          onPress={() => router.replace('/home')} 
          style={({ pressed }) => [styles.exitBtn, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <Image 
            source={require('../../assets/game_screen/settings_icon.png')} 
            style={styles.settingsIcon} 
            contentFit="contain" 
          />
        </Pressable>

        {/* Autoplay Toggle */}
        <Pressable 
          onPress={() => setIsAutoplay(prev => !prev)} 
          style={styles.autoplayToggle}
        >
          <PixelText style={styles.autoplayToggleText} fillColor="#FFFFFF" strokeColor="#000000">
            {isAutoplay ? "AUTO: ON" : "AUTO: OFF"}
          </PixelText>
        </Pressable>

        {/* BOT side indicators */}
        <View style={styles.botIndicators}>
          {Array.from({ length: matchState.maxRounds }).map((_, i) => {
             const res = roundHistory[i]?.botResult;
             let source = require('../../assets/game_screen/empty_score.png');
             if (res === 'win') source = require('../../assets/game_screen/won_point.png');
             if (res === 'lose') source = require('../../assets/game_screen/lost_point.png');
             return (
               <Image 
                 key={i} 
                 source={source} 
                 style={styles.indicatorScore} 
                 contentFit="contain" 
               />
             );
          })}
        </View>

        {/* PLAYER side indicators */}
        <View style={styles.playerIndicators}>
          {Array.from({ length: matchState.maxRounds }).map((_, i) => {
             const res = roundHistory[i]?.userResult;
             let source = require('../../assets/game_screen/empty_score.png');
             if (res === 'win') source = require('../../assets/game_screen/won_point.png');
             if (res === 'lose') source = require('../../assets/game_screen/lost_point.png');
             return (
               <Image 
                 key={i} 
                 source={source} 
                 style={styles.indicatorScore} 
                 contentFit="contain" 
               />
             );
          })}
        </View>

        <View style={styles.botNameContainer}>
          <PixelText style={styles.nameText} fillColor="#FFDE4D" strokeColor="#000000">BOT</PixelText>
        </View>
        
        <View style={styles.playerNameContainer}>
          <PixelText style={styles.nameText} fillColor="#4DB8FF" strokeColor="#000000">
            {userProfile?.username?.toUpperCase() || 'SOU'}
          </PixelText>
        </View>

        {/* Arena */}
        <View style={styles.arena}>
          {/* Bot hand points downwards */}
          <Animated.View style={[styles.botHandContainer, { transform: [{ translateY: shakeBotY }] }]}>
            <Image 
              source={getHandSource(true, computerChoice)} 
              style={[getHandStyle(computerChoice), { transform: [{ rotate: '180deg' }] }]} 
              contentFit="contain" 
            />
          </Animated.View>

          {/* Countdown timer overlay */}
          {phase === 'counting' && (
            <Animated.View style={[styles.centerTextContainer, { transform: [{ scale: countdownScale }] }]}>
              <PixelText style={styles.countdownText} fillColor="#FFFFFF" strokeColor="#000000">
                {countdown}
              </PixelText>
            </Animated.View>
          )}

          {/* Player hand points upwards */}
          <Animated.View style={[styles.playerHandContainer, { transform: [{ translateY: shakePlayerY }] }]}>
            <Image 
              source={getHandSource(false, userChoice)} 
              style={getHandStyle(userChoice)} 
              contentFit="contain" 
            />
          </Animated.View>
        </View>

        {/* Round Outcome Banner overlay */}
        {phase === 'outcome' && result && (
          <View style={styles.bannerOverlay}>
            <ImageBackground
              source={result === 'draw' ? require('../../assets/game_screen/draw_state.png') : require('../../assets/game_screen/round_result.png')}
              style={styles.bannerBg}
              resizeMode="stretch"
            >
              {result === 'lose' && (
                <View style={styles.coverBox}>
                  <PixelText fillColor="#F44336" strokeColor="#000000" style={styles.bannerText}>
                    POINT TO BOT!
                  </PixelText>
                </View>
              )}
              {result === 'win' && (
                <View style={styles.coverBox}>
                  <PixelText fillColor="#4CAF50" strokeColor="#000000" style={styles.bannerText}>
                    POINT TO YOU!
                  </PixelText>
                </View>
              )}
              {result === 'draw' && (
                <View style={styles.coverBox}>
                  <PixelText fillColor="#9E9E9E" strokeColor="#000000" style={styles.bannerText}>
                    ROUND DRAW!
                  </PixelText>
                </View>
              )}
            </ImageBackground>
          </View>
        )}

        {/* Player controls */}
        {phase === 'selecting' && (
          <View style={styles.choicesRow}>
            <Pressable onPress={() => playRound('rock')} style={({ pressed }) => [styles.choicePressable, pressed && { transform: [{ translateY: 2 }] }]}>
              <Image source={require('../../assets/game_screen/Stone.png')} style={styles.choiceIcon} contentFit="contain" />
            </Pressable>
            <Pressable onPress={() => playRound('paper')} style={({ pressed }) => [styles.choicePressable, pressed && { transform: [{ translateY: 2 }] }]}>
              <Image source={require('../../assets/game_screen/Paper.png')} style={styles.choiceIcon} contentFit="contain" />
            </Pressable>
            <Pressable onPress={() => playRound('scissors')} style={({ pressed }) => [styles.choicePressable, pressed && { transform: [{ translateY: 2 }] }]}>
              <Image source={require('../../assets/game_screen/Scissors.png')} style={styles.choiceIcon} contentFit="contain" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    width: '100%', 
    height: '100%' 
  },
  container: { 
    flex: 1, 
    position: 'relative' 
  },
  exitBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 50,
  },
  settingsIcon: {
    width: 44,
    height: 44,
  },
  autoplayToggle: {
    position: 'absolute',
    top: 45,
    left: 24,
    zIndex: 50,
    backgroundColor: '#FFDE4D',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 6,
    borderRadius: 6,
  },
  autoplayToggleText: {
    fontSize: 8,
  },
  botIndicators: { 
    position: 'absolute', 
    left: 20, 
    top: '22%', 
    gap: 10, 
    zIndex: 10 
  },
  playerIndicators: { 
    position: 'absolute', 
    right: 20, 
    bottom: 180, 
    gap: 10, 
    zIndex: 10 
  },
  indicatorScore: { 
    width: 32, 
    height: 32 
  },
  botNameContainer: { 
    position: 'absolute', 
    top: 110, 
    left: 24, 
    zIndex: 10 
  },
  playerNameContainer: { 
    position: 'absolute', 
    bottom: 120, 
    right: 24, 
    zIndex: 10 
  },
  nameText: { 
    fontSize: 18 
  },
  arena: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  botHandContainer: { 
    position: 'absolute', 
    top: 0, 
    width: '100%', 
    alignItems: 'center' 
  },
  playerHandContainer: { 
    position: 'absolute', 
    bottom: 120, 
    width: '100%', 
    alignItems: 'center' 
  },
  centerTextContainer: { 
    position: 'absolute', 
    top: '40%', 
    zIndex: 20 
  },
  countdownText: { 
    fontSize: 48 
  },
  choicesRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    paddingBottom: 20, 
    position: 'absolute', 
    bottom: 20, 
    width: '100%', 
    zIndex: 30 
  },
  choicePressable: {
    width: 72,
    height: 72,
    backgroundColor: '#FFDE4D',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    // 3D Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  choiceIcon: {
    width: 44,
    height: 44,
  },
  bannerOverlay: {
    position: 'absolute',
    top: '35%',
    width: 300,
    aspectRatio: 1448 / 615,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  bannerBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 16,
  },
  coverBox: {
    position: 'absolute',
    bottom: '20%',
    width: '85%',
    height: 48,
    backgroundColor: '#FFD600',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
