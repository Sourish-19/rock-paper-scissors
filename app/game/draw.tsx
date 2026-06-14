import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Pressable, Share } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

export default function DrawScreen() {
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
      const result = await Share.share({
        message: `I just tied a game of Retro Rock Paper Scissors! 🤝 Score: ${userScore}-${computerScore}. Current Streak: ${winStreak} wins!`,
      });
      if (result.action === Share.sharedAction) {
        setShareStatus('SHARED SUCCESSFULLY!');
        setTimeout(() => setShareStatus(''), 2000);
      }
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        {/* Draw Header */}
        <View style={styles.titleContainer}>
          <PixelText style={styles.titleText} fillColor="#FFFFFF" strokeColor="#000000">
            DRAW
          </PixelText>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <PixelText style={styles.statsText} fillColor="#FFFFFF" strokeColor="#000000">
              SCORE   {userScore}:{computerScore}
            </PixelText>
          </View>
          <View style={styles.statsBox}>
            <PixelText style={styles.statsText} fillColor="#FFFFFF" strokeColor="#000000">
              STREAK   {winStreak}
            </PixelText>
          </View>
        </View>

        <View style={styles.shareButtonContainer}>
          <RetroButton
            title={shareStatus ? shareStatus : "SHARE"}
            onPress={handleShare}
            backgroundColor="#FFDE4D"
            style={{ width: 140, height: 40 }}
          />
        </View>

        {/* Character on Cracked Pillar */}
        <View style={styles.sceneSection}>
          <Image 
            source={require('../../assets/images/characters/char_avatar_defeat.png')} 
            style={styles.character} 
            contentFit="contain" 
          />
          <Image 
            source={require('../../assets/images/decorations/pillar_defeat.png')} 
            style={styles.pillar} 
            contentFit="contain" 
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <RetroButton
            title="PLAY AGAIN"
            onPress={handlePlayAgain}
            backgroundColor="#FFDE4D"
          />
          <RetroButton
            title="MAIN MENU"
            onPress={handleGoHome}
            backgroundColor="#FFFFFF"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#4DB8FF', // Blue sky
  },
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
  },
  titleText: {
    fontSize: 48,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  statsBox: {
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: '#FFDE4D',
    padding: 12,
    width: '80%',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
  },
  shareButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  sceneSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  character: {
    width: 140,
    height: 180,
    position: 'absolute',
    bottom: 90,
    zIndex: 2,
  },
  pillar: {
    width: 160,
    height: 120,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  buttonsContainer: {
    width: '100%',
    paddingBottom: 20,
    marginTop: 40,
  },
});
