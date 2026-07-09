import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Pressable, Share, ImageBackground, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { PixelText } from '@/components/PixelText';

const { width, height } = Dimensions.get('window');

const StatsBox = ({ label, value }: any) => {
  return (
    <ImageBackground
      source={require('../../assets/victory_screen_solo_match/score_streak_box.png')}
      style={styles.statsBox}
      resizeMode="stretch"
    >
      <PixelText style={styles.statsText} fillColor="#FFFFFF" strokeColor="#000000">
        {label}   {value}
      </PixelText>
    </ImageBackground>
  );
};

const ResultButton = ({ onPress, title }: any) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.resultBtnContainer,
      pressed && { transform: [{ translateY: 4 }] }
    ]}>
      <ImageBackground
        source={require('../../assets/victory_screen_solo_match/rematch_home_button.png')}
        style={styles.resultBtnBg}
        resizeMode="stretch"
      >
        <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.resultBtnText}>
          {title}
        </PixelText>
      </ImageBackground>
    </Pressable>
  );
};

export default function VictoryScreen() {
  const router = useRouter();
  const { matchState, winStreak, resetScore, resetMatch } = useGameStore();
  const { userScore, computerScore } = matchState;

  const [shareStatus, setShareStatus] = useState('');

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
      const shareResult = await Share.share({
        message: `I just won a game of Retro Rock Paper Scissors! 🏆 Score: ${userScore}-${computerScore}. Current Streak: ${winStreak} wins! Can you beat me?`,
      });
      if (shareResult.action === Share.sharedAction) {
        setShareStatus('SHARED!');
        setTimeout(() => setShareStatus(''), 2000);
      }
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/victory_screen_solo_match/Sky.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Floating clouds */}
        <Image 
          source={require('../../assets/victory_screen_solo_match/cloud_1.png')} 
          style={[styles.cloud, { top: height * 0.1, left: -25, width: 140, height: 70 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../../assets/victory_screen_solo_match/cloud_2.png')} 
          style={[styles.cloud, { top: height * 0.05, right: -15, width: 110, height: 55 }]} 
          contentFit="contain" 
        />

        <View style={styles.container}>
          {/* Victory Header Image */}
          <View style={styles.titleContainer}>
            <Image
              source={require('../../assets/victory_screen_solo_match/victory.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <StatsBox label="SCORE" value={`${userScore}:${computerScore}`} />
            <StatsBox label="STREAK" value={winStreak} />
          </View>

          {/* Share Button using share_button.png */}
          <View style={styles.shareButtonContainer}>
            <Pressable onPress={handleShare} style={({ pressed }) => [styles.shareBtnContainer, pressed && { transform: [{ translateY: 2 }] }]}>
              <ImageBackground
                source={require('../../assets/victory_screen_solo_match/share_button.png')}
                style={styles.shareBtnBg}
                resizeMode="stretch"
              >
                <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.shareBtnText}>
                  {shareStatus ? shareStatus : "SHARE"}
                </PixelText>
              </ImageBackground>
            </Pressable>
          </View>

          {/* Character standing on Victory Stadium stand */}
          <View style={styles.sceneSection}>
            {/* Floating Stars */}
            <Image 
              source={require('../../assets/victory_screen_solo_match/STAR BLOCKS.png')} 
              style={[styles.star, { top: 0, left: 30, width: 32, height: 30 }]} 
              contentFit="contain" 
            />
            <Image 
              source={require('../../assets/victory_screen_solo_match/STAR BLOCKS-1.png')} 
              style={[styles.star, { top: -20, right: 35, width: 34, height: 32 }]} 
              contentFit="contain" 
            />
            <Image 
              source={require('../../assets/victory_screen_solo_match/STAR BLOCKS-2.png')} 
              style={[styles.star, { top: 30, right: 10, width: 34, height: 32 }]} 
              contentFit="contain" 
            />

            {/* Platform + Smile Guy avatar */}
            <View style={styles.characterGroup}>
              <Image 
                source={require('../../assets/victory_screen_solo_match/SMILE GUY.png')} 
                style={styles.character} 
                contentFit="contain" 
              />
              {/* Crown placed above character head */}
              <Image 
                source={require('../../assets/victory_screen_solo_match/CROWN_BLOCKS.png')} 
                style={styles.characterCrown} 
                contentFit="contain" 
              />
            </View>
            
            <Image 
              source={require('../../assets/victory_screen_solo_match/Victory Stadium.png')} 
              style={styles.pedestal} 
              contentFit="contain" 
            />
          </View>

          {/* Rematch/Go Home Action Buttons */}
          <View style={styles.buttonsContainer}>
            <ResultButton
              title="PLAY AGAIN"
              onPress={handlePlayAgain}
            />
            <ResultButton
              title="MAIN MENU"
              onPress={handleGoHome}
            />
          </View>
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cloud: {
    position: 'absolute',
    opacity: 0.7,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: 250,
    height: 48,
  },
  statsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  statsBox: {
    width: 280,
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
  },
  shareButtonContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  shareBtnContainer: {
    width: 130,
    height: 56,
    alignSelf: 'center',
  },
  shareBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 10,
  },
  sceneSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: 180,
    position: 'relative',
    marginTop: 10,
  },
  characterGroup: {
    position: 'absolute',
    bottom: 105,
    width: 85,
    height: 110,
    zIndex: 2,
    alignItems: 'center',
  },
  character: {
    width: '100%',
    height: '100%',
  },
  characterCrown: {
    position: 'absolute',
    top: -12,
    width: 24,
    height: 20,
    zIndex: 3,
  },
  pedestal: {
    width: 140,
    height: 156,
    position: 'absolute',
    bottom: 5,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.9,
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 15,
    marginTop: 15,
  },
  resultBtnContainer: {
    width: 280,
    height: 66,
    alignSelf: 'center',
    marginBottom: 12,
  },
  resultBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBtnText: {
    fontSize: 12,
  },
});
