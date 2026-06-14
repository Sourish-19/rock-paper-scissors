import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useMusic } from '@/components/MusicProvider';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

export default function HomeScreen() {
  const router = useRouter();
  const { setGameMode, resetScore, userProfile } = useGameStore();
  const { isMuted, toggleMute } = useMusic();
  const [showMultiModal, setShowMultiModal] = useState(false);

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Row */}
        <View style={styles.header}>
          {/* Profile Badge */}
          <View style={styles.profileBadge}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={require('../assets/images/characters/char_avatar_idle.png')} 
                style={styles.profileImage} 
                contentFit="cover" 
              />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameBox}>
                <Text style={styles.profileName}>{userProfile.username}</Text>
              </View>
              <View style={styles.crownBox}>
                 <Text style={styles.crownIcon}>👑</Text>
                 <Text style={styles.crownText}>{userProfile.crowns}</Text>
              </View>
            </View>
          </View>

          {/* Settings Icon */}
          <Pressable onPress={toggleMute} style={{ opacity: isMuted ? 0.5 : 1 }}>
            <Image 
              source={require('../assets/images/buttons/btn_settings.png')} 
              style={styles.settingsIcon} 
              contentFit="contain" 
            />
          </Pressable>
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
           <PixelText style={styles.titleText} strokeColor="#000000" fillColor="#FFFFFF">
             ROCK{'\n'}PAPER{'\n'}SCISSORS
           </PixelText>
        </View>

        {/* Center Character Area (Floating Island & Idle Avatar) */}
        <View style={styles.avatarSection}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }], alignItems: 'center' }}>
            {/* Floating Island (rendered behind the character by ordering) */}
            <View style={styles.islandGroup}>
              <Image 
                source={require('../assets/images/decorations/floating_island.png')} 
                style={styles.island} 
                contentFit="contain" 
              />
              {/* The Avatar */}
              <Image 
                source={require('../assets/images/characters/char_avatar_idle.png')} 
                style={styles.character} 
                contentFit="contain" 
              />
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
          <RetroButton
            title="PLAY VS FRIEND"
            onPress={handlePlayVsFriend}
            backgroundColor="#FFDE4D"
          />
        </View>

        {/* Custom Retro Modal for Multiplayer */}
        {showMultiModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <PixelText style={styles.modalTitle}>ONLINE DUEL</PixelText>
              <Text style={styles.modalBody}>
                MULTIPLAYER MODE IS COMING SOON!{'\n'}{'\n'}
                CHALLENGE THE BOT FOR NOW!
              </Text>
              <View style={{ height: 20 }} />
              <RetroButton
                title="OK"
                onPress={() => setShowMultiModal(false)}
                backgroundColor="#FFDE4D"
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#4DB8FF', // matching the blue sky from design
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 10,
  },
  profileBadge: {
    flexDirection: 'row',
    backgroundColor: '#FFDE4D',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#4DB8FF',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    marginTop: 8,
  },
  profileInfo: {
    marginLeft: 6,
    justifyContent: 'space-between',
    height: 40,
  },
  profileNameBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  profileName: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000000',
  },
  crownBox: {
    flexDirection: 'row',
    backgroundColor: '#FFDE4D',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  crownIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  crownText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000000',
  },
  settingsIcon: {
    width: 48,
    height: 48,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  titleText: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: 'center',
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  islandGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 250,
  },
  character: {
    width: 140,
    height: 180,
    position: 'absolute',
    bottom: 50,
    zIndex: 2,
  },
  island: {
    width: 250,
    height: 120,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
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
    fontSize: 20,
    marginBottom: 20,
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
