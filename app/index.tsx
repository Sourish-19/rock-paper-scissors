import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useMusic } from '@/components/MusicProvider';
import { CheckerboardBackground } from '@/components/CheckboardBackground';
import { RetroButton } from '@/components/RetroButton';

export default function HomeScreen() {
  const router = useRouter();
  const { setGameMode, resetScore } = useGameStore();
  const { isMuted, toggleMute } = useMusic();

  const [showMultiModal, setShowMultiModal] = useState(false);

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Floating island idle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse title scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleScale, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 0.97,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePlayVsBot = () => {
    setGameMode('single');
    resetScore();
    router.push('/game');
  };

  const handlePlayVsFriend = () => {
    setShowMultiModal(true);
  };

  return (
    <CheckerboardBackground>
      <SafeAreaView style={styles.container}>
        {/* Top Header Row */}
        <View style={styles.header}>
          <Pressable style={styles.settingsIcon} onPress={toggleMute}>
            <Text style={styles.settingsText}>{isMuted ? '🔇' : '🔊'}</Text>
          </Pressable>
        </View>

        {/* Title Section */}
        <Animated.View style={[styles.titleContainer, { transform: [{ scale: titleScale }] }]}>
          <Text style={styles.titleShadow}>ROCK{'\n'}PAPER{'\n'}SCISSORS</Text>
          <Text style={styles.titleText}>ROCK{'\n'}PAPER{'\n'}SCISSORS</Text>
        </Animated.View>

        {/* Center Character Area (Floating Island & Idle Avatar) */}
        <View style={styles.avatarSection}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }], alignItems: 'center' }}>
            {/* The Avatar */}
            <View style={styles.characterContainer}>
              {/* Hair/Cap */}
              <View style={styles.hair} />
              {/* Face */}
              <View style={styles.face}>
                {/* Sunglasses */}
                <View style={styles.sunglasses} />
                {/* Smile */}
                <View style={styles.mouth} />
              </View>
              {/* Shirt */}
              <View style={styles.shirt} />
            </View>

            {/* Floating Island */}
            <View style={styles.islandContainer}>
              <View style={styles.islandGrass} />
              <View style={styles.islandDirt} />
            </View>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <RetroButton
            title="PLAY VS BOT"
            onPress={handlePlayVsBot}
            backgroundColor="#FFDE4D"
          />
          <View style={{ height: 16 }} />
          <RetroButton
            title="PLAY VS FRIEND"
            onPress={handlePlayVsFriend}
            backgroundColor="#4DCEFF"
          />
        </View>

        {/* Custom Retro Modal for Multiplayer */}
        {showMultiModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>ONLINE DUEL</Text>
              <Text style={styles.modalBody}>
                MULTIPLAYER MODE IS COMING SOON IN V2!{'\n'}{'\n'}
                CHALLENGE THE BOT FOR NOW!
              </Text>
              <View style={{ height: 20 }} />
              <RetroButton
                title="OK"
                onPress={() => setShowMultiModal(false)}
                backgroundColor="#FFDE4D"
                style={{ height: 45 }}
              />
            </View>
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 10,
    position: 'relative',
  },
  titleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 28,
    lineHeight: 38,
    color: '#FFDE4D',
    textAlign: 'center',
    textShadowColor: '#FF9F00',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  titleShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 28,
    lineHeight: 38,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: -10,
  },
  hair: {
    width: 40,
    height: 12,
    backgroundColor: '#3E2723',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 3,
    borderColor: '#000000',
  },
  face: {
    width: 46,
    height: 34,
    backgroundColor: '#FFCC80',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunglasses: {
    width: 36,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
  },
  mouth: {
    width: 12,
    height: 3,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 8,
  },
  shirt: {
    width: 36,
    height: 20,
    backgroundColor: '#29B6F6',
    borderWidth: 3,
    borderColor: '#000000',
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  islandContainer: {
    width: 140,
    height: 50,
    alignItems: 'center',
  },
  islandGrass: {
    width: '100%',
    height: 16,
    backgroundColor: '#81C784',
    borderWidth: 4,
    borderColor: '#000000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  islandDirt: {
    width: '90%',
    height: 20,
    backgroundColor: '#8D6E63',
    borderWidth: 4,
    borderColor: '#000000',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBody: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    lineHeight: 18,
    color: '#333333',
    textAlign: 'center',
  },
});
