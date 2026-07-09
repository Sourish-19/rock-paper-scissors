import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated, Pressable, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useMusic } from '@/components/MusicProvider';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

const HomeButton = ({ onPress, title }: any) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.homeBtnContainer,
      pressed && { transform: [{ translateY: 4 }] }
    ]}>
      <ImageBackground
        source={require('../assets/home_screen/game_button.png')}
        style={styles.homeBtnBg}
        resizeMode="stretch"
      >
        <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.homeBtnText}>
          {title}
        </PixelText>
      </ImageBackground>
    </Pressable>
  );
};

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
    router.push('/game-mode');
  };

  const handlePlayVsFriend = () => {
    setGameMode('multi');
    resetScore();
    router.push({ pathname: '/game-mode', params: { mode: 'multi' } });
  };

  return (
    <ImageBackground 
      source={require('../assets/home_screen/Sky.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Floating clouds in background */}
        <Image 
          source={require('../assets/general/cloud_1.png')} 
          style={[styles.cloud, { top: 120, left: -25, width: 140, height: 70 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { top: 70, right: -15, width: 110, height: 55 }]} 
          contentFit="contain" 
        />

        <View style={styles.container}>
          {/* Top Header Row */}
          <View style={styles.header}>
            {/* Profile Badge card using profile_holder.png */}
            <ImageBackground
              source={require('../assets/home_screen/profile_holder.png')}
              style={styles.profileBadgeBg}
              resizeMode="stretch"
            >
              <View style={styles.profileContent}>
                {/* Left square area for profile pic */}
                <View style={styles.profilePicContainer}>
                  <Image 
                    source={userProfile.gender === 'female'
                      ? require('../assets/home_screen/female_profile_pic.png')
                      : require('../assets/home_screen/male_profile_pic.png')} 
                    style={styles.profileImage} 
                    contentFit="contain" 
                  />
                </View>
                {/* Right compartments area for name and score */}
                <View style={styles.profileInfo}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.profileName} numberOfLines={1}>{userProfile.username}</Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Image 
                      source={require('../assets/home_screen/CROWN BLOCKS.png')} 
                      style={styles.crownImage} 
                      contentFit="contain" 
                    />
                    <Text style={styles.crownText}>{userProfile.crowns}</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>

            {/* Settings Icon */}
            <Pressable onPress={() => router.push('/settings')} style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}>
              <Image 
                source={require('../assets/home_screen/Settings Button.png')} 
                style={styles.settingsIcon} 
                contentFit="contain" 
              />
            </Pressable>
          </View>

          {/* Title Logo Section */}
          <View style={styles.titleContainer}>
            <Image
              source={require('../assets/home_screen/logo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>

          {/* Center Character Area (Floating Island & SMILE GUY) */}
          <View style={styles.avatarSection}>
            <Animated.View style={{ transform: [{ translateY: floatAnim }], alignItems: 'center' }}>
              <View style={styles.islandGroup}>
                {/* Floating Island crumbles */}
                <Image 
                  source={require('../assets/home_screen/floating_island_crumble_1.png')} 
                  style={[styles.crumble, { bottom: 18, left: 30, width: 12, height: 14 }]} 
                  contentFit="contain" 
                />
                <Image 
                  source={require('../assets/home_screen/floating_island_crumble_2.png')} 
                  style={[styles.crumble, { bottom: 8, right: 35, width: 18, height: 20 }]} 
                  contentFit="contain" 
                />
                <Image 
                  source={require('../assets/home_screen/floating_island_crumble_3.png')} 
                  style={[styles.crumble, { bottom: -12, left: 95, width: 14, height: 16 }]} 
                  contentFit="contain" 
                />

                {/* Floating Island */}
                <Image 
                  source={require('../assets/home_screen/floating_island.png')} 
                  style={styles.island} 
                  contentFit="contain" 
                />
                 {/* The Character (SMILE GUY or SMILE GIRL) */}
                 <Image 
                   source={userProfile.gender === 'female'
                     ? require('../assets/victory_screen_solo_match/SMILE GIRL.png')
                     : require('../assets/home_screen/SMILE_GUY.png')} 
                   style={styles.character} 
                   contentFit="contain" 
                 />
              </View>
            </Animated.View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <HomeButton
              title="PLAY VS BOT"
              onPress={handlePlayVsBot}
            />
            <HomeButton
              title="PLAY VS FRIEND"
              onPress={handlePlayVsFriend}
            />
          </View>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  cloud: {
    position: 'absolute',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    zIndex: 3,
  },
  profileBadgeBg: {
    width: 170,
    height: 66,
  },
  profileContent: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  profilePicContainer: {
    width: 66,
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
    height: 66,
    paddingLeft: 8,
    paddingRight: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  nameContainer: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    height: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000000',
    textAlign: 'center',
  },
  crownImage: {
    width: 16,
    height: 14,
    marginRight: 4,
  },
  crownText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000000',
  },
  settingsIcon: {
    width: 52,
    height: 52,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 35,
    zIndex: 3,
  },
  logoImage: {
    width: 325,
    height: 208,
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  islandGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 240,
  },
  character: {
    width: 90,
    height: 120,
    position: 'absolute',
    bottom: 50,
    zIndex: 2,
  },
  island: {
    width: 260,
    height: 191,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  crumble: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.8,
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 20,
    zIndex: 3,
  },
  homeBtnContainer: {
    width: '100%',
    height: 60,
    marginBottom: 16,
  },
  homeBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 14,
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
