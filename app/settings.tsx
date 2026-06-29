import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Pressable, TextInput, ImageBackground, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useMusic } from '@/components/MusicProvider';
import { PixelText } from '@/components/PixelText';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

const VolumeBox = ({ label, value, onAdjust }: { label: string; value: number; onAdjust: (dir: 'plus' | 'minus') => void }) => {
  return (
    <ImageBackground
      source={require('../assets/settings_screen/sound_music_box.png')}
      style={styles.volumeBox}
      resizeMode="stretch"
    >
      <View style={styles.volumeContent}>
        <PixelText style={styles.volumeLabel} fillColor="#FFFFFF" strokeColor="#000000">
          {label}
        </PixelText>
        
        <View style={styles.controlsRow}>
          <Pressable onPress={() => onAdjust('minus')} style={({ pressed }) => [styles.adjustBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
            <Image source={require('../assets/settings_screen/minus_button.png')} style={styles.adjustIcon} contentFit="contain" />
          </Pressable>
          
          <ImageBackground
            source={require('../assets/settings_screen/SOUND_MUSIC_BATTERY.png')}
            style={styles.batteryShell}
            resizeMode="stretch"
          >
            <View style={styles.ticksRow}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Image
                  key={idx}
                  source={require('../assets/settings_screen/one_unit_sound_music_notation.png')}
                  style={[
                    styles.tickUnit,
                    { opacity: idx < value ? 1 : 0.15 }
                  ]}
                  contentFit="contain"
                />
              ))}
            </View>
          </ImageBackground>
          
          <Pressable onPress={() => onAdjust('plus')} style={({ pressed }) => [styles.adjustBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
            <Image source={require('../assets/settings_screen/PLUS BUTTON.png')} style={styles.adjustIcon} contentFit="contain" />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile, setUserSession } = useGameStore();
  const { soundVolume, musicVolume, setSoundVolume, setMusicVolume } = useMusic();

  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(userProfile.username);
  
  const currentGender = userProfile.gender || 'male';

  const handleGoBack = () => {
    router.replace('/home');
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setUserProfile({
        ...userProfile,
        username: usernameInput.trim() || userProfile.username,
      });
    } else {
      setUsernameInput(userProfile.username);
    }
    setIsEditing(!isEditing);
  };

  const handleToggleGender = () => {
    const nextGender = currentGender === 'male' ? 'female' : 'male';
    setUserProfile({
      ...userProfile,
      gender: nextGender,
    });
  };

  const handleAdjustMusic = (dir: 'plus' | 'minus') => {
    const newVol = dir === 'plus' 
      ? Math.min(5, musicVolume + 1) 
      : Math.max(0, musicVolume - 1);
    setMusicVolume(newVol);
  };

  const handleAdjustSound = (dir: 'plus' | 'minus') => {
    const newVol = dir === 'plus' 
      ? Math.min(5, soundVolume + 1) 
      : Math.max(0, soundVolume - 1);
    setSoundVolume(newVol);
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      setUserSession(null);
      router.replace('/login');
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/settings_screen/Sky.png')}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable onPress={handleGoBack} style={({ pressed }) => [styles.backBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
            <Image
              source={require('../assets/settings_screen/go_back_button.png')}
              style={styles.backBtnImg}
              contentFit="contain"
            />
          </Pressable>
          <Image
            source={require('../assets/settings_screen/settings_vector.png')}
            style={styles.titleImg}
            contentFit="contain"
          />
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.content}>
          
          {/* Profile Card Section */}
          <ImageBackground
            source={require('../assets/settings_screen/username_gender_box.png')}
            style={styles.profileCard}
            resizeMode="stretch"
          >
            <View style={styles.profileContent}>
              {/* Avatar section with left/right arrows */}
              <View style={styles.avatarControls}>
                <Pressable onPress={handleToggleGender} style={styles.arrowBtn}>
                  <Image source={require('../assets/settings_screen/LEFT ARROW.png')} style={styles.arrowIcon} contentFit="contain" />
                </Pressable>
                
                <View style={styles.avatarWrapper}>
                  <Image source={require('../assets/settings_screen/activr_state.png')} style={styles.activeFrame} />
                  <Image
                    source={currentGender === 'female'
                      ? require('../assets/home_screen/female_profile_pic.png')
                      : require('../assets/home_screen/male_profile_pic.png')}
                    style={styles.avatarImg}
                    contentFit="contain"
                  />
                </View>

                <Pressable onPress={handleToggleGender} style={styles.arrowBtn}>
                  <Image source={require('../assets/settings_screen/RIGHT ARROW.png')} style={styles.arrowIcon} contentFit="contain" />
                </Pressable>
              </View>

              {/* Username Input or Display */}
              <View style={styles.usernameSection}>
                {isEditing ? (
                  <TextInput
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                    style={styles.usernameInput}
                    maxLength={10}
                    autoFocus
                  />
                ) : (
                  <PixelText style={styles.usernameText} fillColor="#FFFFFF" strokeColor="#000000">
                    {userProfile.username}
                  </PixelText>
                )}
                
                <Pressable onPress={handleToggleEdit} style={styles.editBtn}>
                  <Image
                    source={require('../assets/settings_screen/edit_button.png')}
                    style={styles.editBtnImg}
                    contentFit="contain"
                  />
                </Pressable>
              </View>
            </View>
          </ImageBackground>

          {/* Music Volume Controller Box */}
          <VolumeBox label="MUSIC" value={musicVolume} onAdjust={handleAdjustMusic} />

          {/* Sound Volume Controller Box */}
          <VolumeBox label="SOUND" value={soundVolume} onAdjust={handleAdjustSound} />

          {/* Logout Button */}
          <Pressable onPress={handleLogOut} style={({ pressed }) => [styles.logoutBtn, pressed && { transform: [{ translateY: 4 }] }]}>
            <ImageBackground
              source={require('../assets/settings_screen/log_out_button.png')}
              style={styles.logoutBtnBg}
              resizeMode="stretch"
            >
              <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.logoutBtnText}>
                LOG OUT
              </PixelText>
            </ImageBackground>
          </Pressable>

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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
  },
  backBtnImg: {
    width: '100%',
    height: '100%',
  },
  titleImg: {
    flex: 1,
    height: 38,
    marginHorizontal: 10,
  },
  backPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  profileCard: {
    width: 310,
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    justifyContent: 'space-between',
  },
  arrowBtn: {
    padding: 6,
  },
  arrowIcon: {
    width: 14,
    height: 20,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFrame: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    zIndex: 2,
  },
  usernameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '50%',
    gap: 8,
  },
  usernameText: {
    fontSize: 10,
  },
  usernameInput: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 4,
    width: '75%',
    textAlign: 'center',
  },
  editBtn: {
    width: 32,
    height: 32,
  },
  editBtnImg: {
    width: '100%',
    height: '100%',
  },
  volumeBox: {
    width: 300,
    height: 110,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  volumeContent: {
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 10,
    marginBottom: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  adjustBtn: {
    width: 36,
    height: 36,
  },
  adjustIcon: {
    width: '100%',
    height: '100%',
  },
  batteryShell: {
    width: 180,
    height: 36,
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 20,
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '82%',
    height: '60%',
    alignItems: 'center',
  },
  tickUnit: {
    width: 18,
    height: 18,
  },
  logoutBtn: {
    width: 200,
    height: 60,
  },
  logoutBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 12,
  },
});
