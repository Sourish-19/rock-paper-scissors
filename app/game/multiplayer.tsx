import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable, ImageBackground, Dimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGameStore, Choice } from '@/store/gameStore';
import { PixelText } from '@/components/PixelText';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function MultiplayerGameScreen() {
  const router = useRouter();
  const { roomId, myUid } = useLocalSearchParams();
  const { userProfile, setMaxRounds } = useGameStore();

  const [roomData, setRoomData] = useState<any>(null);
  const [phase, setPhase] = useState<'selecting' | 'waiting' | 'counting' | 'outcome'>('selecting');
  const [countdown, setCountdown] = useState<3 | 2 | 1 | 'SHOOT' | ''>(3);
  const [localChoice, setLocalChoice] = useState<Choice | null>(null);
  
  // Exit game modal states
  const [showExitModal, setShowExitModal] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  // Animations
  const shakePlayerY = useRef(new Animated.Value(0)).current;
  const shakeOpponentY = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  const roomCode = roomId as string;
  const isHost = roomData?.creator?.uid === myUid;

  // Resolve players data
  const me = isHost ? roomData?.creator : roomData?.joiner;
  const opponent = isHost ? roomData?.joiner : roomData?.creator;

  const currentRound = roomData?.currentRound || 1;
  const maxRounds = roomData?.maxRounds || 3;
  const roundChoices = roomData?.roundChoices || {};
  const roundWinners = roomData?.roundWinners || {};

  // Retrieve current choices
  const creatorChoice = roundChoices[currentRound]?.creatorChoice;
  const joinerChoice = roundChoices[currentRound]?.joinerChoice;
  const myChoice = isHost ? creatorChoice : joinerChoice;
  const opponentChoice = isHost ? joinerChoice : creatorChoice;

  // Shaking hands animation
  const startShaking = () => {
    shakePlayerY.setValue(0);
    shakeOpponentY.setValue(0);
    const shakeSequence = (anim: Animated.Value, isOpponent: boolean) => 
      Animated.sequence([
        Animated.timing(anim, { toValue: isOpponent ? 15 : -15, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: isOpponent ? -15 : 15, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]);

    Animated.loop(
      Animated.parallel([
        shakeSequence(shakePlayerY, false),
        shakeSequence(shakeOpponentY, true),
      ]),
      { iterations: 4 }
    ).start();
  };

  // Lock and submit player choice to Firestore
  const handleMakeChoice = async (choice: 'rock' | 'paper' | 'scissors') => {
    if (phase !== 'selecting' || !roomCode) return;
    
    setLocalChoice(choice);
    setPhase('waiting');

    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const choiceKey = isHost ? `roundChoices.${currentRound}.creatorChoice` : `roundChoices.${currentRound}.joinerChoice`;
      await updateDoc(roomRef, {
        [choiceKey]: choice,
      });
    } catch (e) {
      console.error('Error saving choice:', e);
    }
  };

  // Compute round winner
  const getRoundWinner = (choiceA: Choice, choiceB: Choice): 'creator' | 'joiner' | 'draw' => {
    if (choiceA === choiceB) return 'draw';
    if (
      (choiceA === 'rock' && choiceB === 'scissors') ||
      (choiceA === 'paper' && choiceB === 'rock') ||
      (choiceA === 'scissors' && choiceB === 'paper')
    ) {
      return 'creator';
    }
    return 'joiner';
  };

  // Handle exiting game
  const handleExitGame = async () => {
    setShowExitModal(false);
    if (!roomCode) return;
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const exitKey = isHost ? 'exits.creatorExited' : 'exits.joinerExited';
      await updateDoc(roomRef, {
        [exitKey]: true,
        status: 'finished',
      });
    } catch (e) {
      console.warn('Error on exit:', e);
    }
    router.replace('/home');
  };

  // Settle round logic
  const settleRound = async (cChoice: Choice, jChoice: Choice) => {
    if (!roomCode || !isHost) return;

    const roundWinner = getRoundWinner(cChoice, jChoice);
    let nextCreatorScore = roomData.creator.score || 0;
    let nextJoinerScore = roomData.joiner.score || 0;

    if (roundWinner === 'creator') nextCreatorScore++;
    if (roundWinner === 'joiner') nextJoinerScore++;

    const targetWins = Math.ceil(maxRounds / 2);
    const roomRef = doc(db, 'rooms', roomCode);

    setTimeout(async () => {
      try {
        if (nextCreatorScore >= targetWins || nextJoinerScore >= targetWins || currentRound >= maxRounds) {
          // End of game
          await updateDoc(roomRef, {
            [`roundWinners.${currentRound}`]: roundWinner,
            'creator.score': nextCreatorScore,
            'joiner.score': nextJoinerScore,
            status: 'finished',
          });
        } else {
          // Go to next round
          await updateDoc(roomRef, {
            [`roundWinners.${currentRound}`]: roundWinner,
            'creator.score': nextCreatorScore,
            'joiner.score': nextJoinerScore,
            currentRound: currentRound + 1,
          });
        }
      } catch (e) {
        console.error('Error settling round in database:', e);
      }
    }, 2500);
  };

  // Listen to Firestore Room State
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = doc(db, 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOpponentLeft(true);
        return;
      }

      const data = snapshot.data();
      setRoomData(data);
      setMaxRounds(data.maxRounds);

      // Check exit statuses
      if (data.exits) {
        const otherPlayerExited = isHost ? data.exits.joinerExited : data.exits.creatorExited;
        if (otherPlayerExited) {
          setOpponentLeft(true);
        }
      }

      // Handle match finish routing
      if (data.status === 'finished') {
        const myFinalScore = isHost ? data.creator?.score : data.joiner?.score;
        const oppFinalScore = isHost ? data.joiner?.score : data.creator?.score;
        
        setTimeout(() => {
          if (myFinalScore > oppFinalScore) {
            router.replace('/game/victory' as any);
          } else if (myFinalScore < oppFinalScore) {
            router.replace('/game/defeat' as any);
          } else {
            router.replace('/game/draw' as any);
          }
          // Cleanup finished room
          if (isHost) {
            deleteDoc(roomRef).catch(e => console.warn('Clean room failed:', e));
          }
        }, 1000);
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Synchronized countdown trigger
  useEffect(() => {
    if (creatorChoice && joinerChoice && phase !== 'counting' && phase !== 'outcome') {
      // Both made choices: trigger the visual countdown sync
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
        
        setTimeout(() => {
          setCountdown('');
        }, 1000);
      }, 1800);

      setTimeout(() => {
        setPhase('outcome');
        // Host triggers DB state update/settle score
        if (isHost) {
          settleRound(creatorChoice, joinerChoice);
        }
      }, 3800);
    } else if (!creatorChoice && !joinerChoice && phase === 'outcome') {
      // Reset back to selecting once host increments the round
      setPhase('selecting');
      setLocalChoice(null);
    }
  }, [creatorChoice, joinerChoice]);

  // Image assets mapping helpers
  const getHandSource = (isOpponent: boolean, choice: Choice) => {
    if (!choice) {
      return isOpponent 
        ? require('../../assets/game_screen/HOLD STATE REDHANDS BLOCK.png') 
        : require('../../assets/game_screen/HOLD STATE BLUE HANDS BLOCK.png');
    }
    const c = choice;
    if (isOpponent) {
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
      heightVal = widthVal * (1276 / 752);
    } else if (gesture === 'paper') {
      heightVal = widthVal * (1540 / 708);
    } else if (gesture === 'scissors') {
      heightVal = widthVal * (1540 / 748);
    }
    
    return {
      width: widthVal,
      height: heightVal,
    };
  };

  // Re-build round results history based on DB roundWinners
  const getRoundHistory = () => {
    const history = [];
    for (let i = 1; i <= maxRounds; i++) {
      const winner = roundWinners[i];
      if (winner === undefined) break;
      
      let myResult: 'win' | 'lose' | 'draw' = 'draw';
      let oppResult: 'win' | 'lose' | 'draw' = 'draw';

      if (winner === 'draw') {
        myResult = 'draw';
        oppResult = 'draw';
      } else if (winner === (isHost ? 'creator' : 'joiner')) {
        myResult = 'win';
        oppResult = 'lose';
      } else {
        myResult = 'lose';
        oppResult = 'win';
      }
      history.push({ myResult, oppResult });
    }
    return history;
  };

  const history = getRoundHistory();

  // Determine round result text overlay
  const getRoundOutcomeText = () => {
    const winner = getRoundWinner(creatorChoice, joinerChoice);
    if (winner === 'draw') return 'DRAW!';
    if (winner === (isHost ? 'creator' : 'joiner')) return 'POINT TO YOU!';
    return 'POINT TO ENEMY!';
  };

  return (
    <ImageBackground 
      source={require('../../assets/game_screen/grass_Background.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        
        {/* Exit match settings cog */}
        <Pressable 
          onPress={() => setShowExitModal(true)} 
          style={({ pressed }) => [styles.exitBtn, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <Image 
            source={require('../../assets/game_screen/settings_icon.png')} 
            style={styles.settingsIcon} 
            contentFit="contain" 
          />
        </Pressable>

        {/* OPPONENT side indicators */}
        <View style={styles.opponentIndicators}>
          {Array.from({ length: maxRounds }).map((_, i) => {
             const res = history[i]?.oppResult;
             let source = require('../../assets/game_screen/empty_score.png');
             if (res === 'win') source = require('../../assets/game_screen/won_point.png');
             if (res === 'lose') source = require('../../assets/game_screen/lost_point.png');
             return (
               <Image 
                 key={i}
                 source={source} 
                 style={styles.indicatorDot} 
                 contentFit="contain" 
               />
             );
          })}
        </View>

        {/* OPPONENT profile badge info */}
        <View style={styles.opponentNameContainer}>
          <PixelText style={styles.playerNameText} fillColor="#FF0000" strokeColor="#000000">
            {opponent?.username || 'OPPONENT'}
          </PixelText>
        </View>

        {/* Hand Arena */}
        <View style={styles.arena}>
          
          {/* Opponent's Red Hand (Top, rotated 180 deg) */}
          <Animated.View style={[
            styles.handWrapper, 
            styles.opponentHand,
            { transform: [{ translateY: shakeOpponentY }, { rotate: '180deg' }] }
          ]}>
            <Image 
              source={getHandSource(true, phase === 'outcome' ? opponentChoice : null)} 
              style={getHandStyle(phase === 'outcome' ? opponentChoice : 'rock')} 
              contentFit="contain" 
            />
          </Animated.View>

          {/* Player's Blue Hand (Bottom) */}
          <Animated.View style={[
            styles.handWrapper, 
            styles.playerHand,
            { transform: [{ translateY: shakePlayerY }] }
          ]}>
            <Image 
              source={getHandSource(false, phase === 'outcome' ? myChoice : null)} 
              style={getHandStyle(phase === 'outcome' ? myChoice : 'rock')} 
              contentFit="contain" 
            />
          </Animated.View>

          {/* Real-time Countdown Synchronizer overlay */}
          {phase === 'counting' && countdown !== '' && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={styles.countdownContainer}>
                <Animated.View style={{ transform: [{ scale: countdownScale }] }}>
                  <PixelText 
                    fillColor={countdown === 'SHOOT' ? '#FFD600' : '#FFFFFF'} 
                    strokeColor="#000000" 
                    style={styles.countdownText}
                  >
                    {countdown}
                  </PixelText>
                </Animated.View>
              </View>
            </View>
          )}

          {/* Round outcomes overlays */}
          {phase === 'outcome' && (
            <View style={styles.coverBoxContainer} pointerEvents="none">
              <ImageBackground
                source={require('../../assets/game_screen/round_result.png')}
                style={styles.coverBoxImage}
                resizeMode="contain"
              >
                <View style={styles.coverBox} />
                <View style={styles.coverTextWrapper}>
                  <PixelText 
                    fillColor="#FFFFFF" 
                    strokeColor="#000000" 
                    style={styles.outcomeMainText}
                  >
                    {getRoundOutcomeText()}
                  </PixelText>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* Waiting for opponent banner */}
          {phase === 'waiting' && (
            <View style={styles.coverBoxContainer} pointerEvents="none">
              <ImageBackground
                source={require('../../assets/game_screen/round_result.png')}
                style={styles.coverBoxImage}
                resizeMode="contain"
              >
                <View style={styles.coverBox} />
                <View style={styles.coverTextWrapper}>
                  <PixelText 
                    fillColor="#FFFFFF" 
                    strokeColor="#000000" 
                    style={styles.outcomeMainText}
                  >
                    WAITING FOR OPPONENT...
                  </PixelText>
                </View>
              </ImageBackground>
            </View>
          )}
        </View>

        {/* Player profile info */}
        <View style={styles.playerNameContainer}>
          <PixelText style={styles.playerNameText} fillColor="#00E1FF" strokeColor="#000000">
            {me?.username || userProfile.username}
          </PixelText>
        </View>

        {/* Player indicators */}
        <View style={styles.playerIndicators}>
          {Array.from({ length: maxRounds }).map((_, i) => {
             const res = history[i]?.myResult;
             let source = require('../../assets/game_screen/empty_score.png');
             if (res === 'win') source = require('../../assets/game_screen/won_point.png');
             if (res === 'lose') source = require('../../assets/game_screen/lost_point.png');
             return (
               <Image 
                 key={i}
                 source={source} 
                 style={styles.indicatorDot} 
                 contentFit="contain" 
               />
             );
          })}
        </View>

        {/* Lower choosing deck */}
        <View style={styles.controls}>
          {phase === 'selecting' ? (
            <View style={styles.choicesRow}>
              <Pressable 
                onPress={() => handleMakeChoice('rock')} 
                style={({ pressed }) => [styles.choicePressable, pressed && { transform: [{ scale: 0.9 }] }]}
              >
                <Image source={require('../../assets/game_screen/Stone.png')} style={styles.choiceIcon} contentFit="contain" />
              </Pressable>

              <Pressable 
                onPress={() => handleMakeChoice('paper')} 
                style={({ pressed }) => [styles.choicePressable, pressed && { transform: [{ scale: 0.9 }] }]}
              >
                <Image source={require('../../assets/game_screen/Paper.png')} style={styles.choiceIcon} contentFit="contain" />
              </Pressable>

              <Pressable 
                onPress={() => handleMakeChoice('scissors')} 
                style={({ pressed }) => [styles.choicePressable, pressed && { transform: [{ scale: 0.9 }] }]}
              >
                <Image source={require('../../assets/game_screen/Scissors.png')} style={styles.choiceIcon} contentFit="contain" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.lockedRow}>
              {localChoice && (
                <View style={styles.lockedBadge}>
                  <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.lockedText}>
                    LOCKED: {localChoice.toUpperCase()}
                  </PixelText>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 1. Modal: Exit Match Confirmation */}
        <Modal transparent visible={showExitModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ImageBackground
                source={require('../../assets/game_screen/exit_game_box.png')}
                style={styles.popupBg}
                imageStyle={{ resizeMode: 'stretch' }}
              >
                <View style={styles.buttonsRow}>
                  <Pressable onPress={handleExitGame} style={({ pressed }) => [styles.popupOkBtn, pressed && { transform: [{ translateY: 2 }] }]}>
                    <ImageBackground
                      source={require('../../assets/game_screen/yes_exit_button.png')}
                      style={styles.okBtnBg}
                      imageStyle={{ resizeMode: 'stretch' }}
                    />
                  </Pressable>

                  <Pressable onPress={() => setShowExitModal(false)} style={({ pressed }) => [styles.popupOkBtn, pressed && { transform: [{ translateY: 2 }] }]}>
                    <ImageBackground
                      source={require('../../assets/game_screen/cancel_button_exit_screen_&_restart_screen.png')}
                      style={styles.okBtnBg}
                      imageStyle={{ resizeMode: 'stretch' }}
                    />
                  </Pressable>
                </View>
              </ImageBackground>
            </View>
          </View>
        </Modal>

        {/* 2. Modal: Opponent disconnected */}
        <Modal transparent visible={opponentLeft} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ImageBackground
                source={require('../../assets/authentiction_screen/missing_info.png')}
                style={styles.popupBg}
                imageStyle={{ resizeMode: 'stretch' }}
              >
                <View style={styles.disconnectTextContainer}>
                  <PixelText fillColor="#FF0000" strokeColor="#000000" style={styles.disconnectLabel}>
                    OPPONENT HAS
                  </PixelText>
                  <PixelText fillColor="#FF0000" strokeColor="#000000" style={styles.disconnectLabel}>
                    LEFT THE MATCH!
                  </PixelText>
                </View>
                
                <Pressable onPress={() => router.replace('/home')} style={({ pressed }) => [styles.popupOkBtnSingle, pressed && { transform: [{ translateY: 2 }] }]}>
                  <ImageBackground
                    source={require('../../assets/authentiction_screen/ok_button.png')}
                    style={styles.okBtnBg}
                    imageStyle={{ resizeMode: 'stretch' }}
                  >
                    <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.okBtnText}>OK</PixelText>
                  </ImageBackground>
                </Pressable>
              </ImageBackground>
            </View>
          </View>
        </Modal>

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
    justifyContent: 'space-between',
    position: 'relative',
  },
  exitBtn: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 44,
    height: 44,
    zIndex: 10,
  },
  settingsIcon: {
    width: '100%',
    height: '100%',
  },
  opponentIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    top: 30,
    left: 20,
    gap: 6,
    zIndex: 9,
  },
  playerIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 180,
    left: '50%',
    transform: [{ translateX: -60 }],
    gap: 6,
    zIndex: 9,
  },
  indicatorDot: {
    width: 32,
    height: 32,
  },
  opponentNameContainer: {
    position: 'absolute',
    top: 75,
    left: 20,
    zIndex: 9,
  },
  playerNameContainer: {
    position: 'absolute',
    bottom: 120,
    left: '50%',
    transform: [{ translateX: -60 }],
    alignItems: 'center',
    width: 120,
    zIndex: 9,
  },
  playerNameText: {
    fontSize: 10,
    textAlign: 'center',
  },
  arena: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 60,
    marginBottom: 100,
  },
  handWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  opponentHand: {
    top: '5%',
  },
  playerHand: {
    bottom: '5%',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  countdownText: {
    fontSize: 36,
    textAlign: 'center',
  },
  coverBoxContainer: {
    position: 'absolute',
    top: '35%',
    width: 300,
    height: 127,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8,
  },
  coverBoxImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  coverBox: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    right: '5%',
    bottom: '20%',
    backgroundColor: '#FFD600',
    zIndex: 1,
  },
  coverTextWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  outcomeMainText: {
    fontSize: 12,
    textAlign: 'center',
  },
  controls: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
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
  lockedRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lockedText: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    height: 165,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 8,
  },
  popupOkBtn: {
    width: 100,
    height: 40,
  },
  popupOkBtnSingle: {
    width: 120,
    height: 48,
    marginBottom: 8,
  },
  okBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  okBtnText: {
    fontSize: 12,
  },
  disconnectTextContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
});
