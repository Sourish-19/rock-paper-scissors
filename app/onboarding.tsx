import React, { useRef, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { PixelText } from '@/components/PixelText';
import { RetroButton } from '@/components/RetroButton';

const { width, height } = Dimensions.get('window');


export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleNext = () => {
    if (currentPage < 2) {
      const nextPage = currentPage + 1;
      scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
      setCurrentPage(nextPage);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/onboarding_screen/Sky.png')} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Clouds */}
        <Image 
          source={require('../assets/general/cloud_1.png')} 
          style={[styles.cloud, { top: height * 0.1, left: -20, width: 150, height: 80 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { top: height * 0.05, right: 10, width: 100, height: 60 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_1.png')} 
          style={[styles.cloud, { top: height * 0.8, left: 20, width: 120, height: 60, opacity: 0.8 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { bottom: height * 0.15, right: -10, width: 140, height: 70, opacity: 0.9 }]} 
          contentFit="contain" 
        />

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
        >
          {/* Slide 1 */}
          <View style={[styles.page, { width }]}>
            <Image source={require('../assets/onboarding_screen/floating_island_1.png')} style={styles.island} contentFit="contain" />
            <Image source={require('../assets/onboarding_screen/question_thought.png')} style={styles.floatingThought} contentFit="contain" />
            
            <View style={styles.textContainer}>
              <PixelText style={styles.title}>WELCOME</PixelText>
              <Text style={styles.subtitle}>Get ready for an epic battle of Rock Paper Scissors.</Text>
            </View>
            <RetroButton 
              title="NEXT" 
              onPress={handleNext} 
              style={styles.actionBtn} 
            />
          </View>

          {/* Slide 2 */}
          <View style={[styles.page, { width }]}>
            <Image source={require('../assets/onboarding_screen/floating_island_2.png')} style={styles.island} contentFit="contain" />
            <Image source={require('../assets/onboarding_screen/hand_thought.png')} style={styles.floatingThought} contentFit="contain" />
            
            {/* Floating RPS items around */}
            <Image source={require('../assets/onboarding_screen/Paper.png')} style={[styles.miniFloat, { top: '30%', left: 40 }]} contentFit="contain" />
            <Image source={require('../assets/onboarding_screen/Scissors.png')} style={[styles.miniFloat, { top: '25%', right: 40 }]} contentFit="contain" />
            <Image source={require('../assets/onboarding_screen/Stone.png')} style={[styles.miniFloat, { top: '45%', right: 60 }]} contentFit="contain" />

            <View style={styles.textContainer}>
              <PixelText style={styles.title}>RULES</PixelText>
              <Text style={styles.subtitle}>Rock crushes Scissors. Scissors cuts Paper. Paper covers Rock.</Text>
            </View>
            <RetroButton 
              title="NEXT" 
              onPress={handleNext} 
              style={styles.actionBtn} 
            />
          </View>

          {/* Slide 3 */}
          <View style={[styles.page, { width }]}>
            <Image source={require('../assets/onboarding_screen/floating_island_3.png')} style={styles.island} contentFit="contain" />
            <Image source={require('../assets/onboarding_screen/vs_thought.png')} style={styles.floatingThought} contentFit="contain" />
            
            <View style={styles.textContainer}>
              <PixelText style={styles.title}>BATTLE!</PixelText>
              <Text style={styles.subtitle}>Defeat the bot or challenge friends!</Text>
            </View>
            <RetroButton 
              title="GET STARTED" 
              onPress={() => router.replace('/login')} 
              style={styles.actionBtn} 
            />
          </View>
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {[0, 1, 2].map((i) => (
            <Image
              key={i}
              source={
                currentPage === i 
                  ? require('../assets/onboarding_screen/dot_fil.png') 
                  : require('../assets/onboarding_screen/dot_unfilled.png')
              }
              style={styles.dotImage}
              contentFit="contain"
            />
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  cloud: {
    position: 'absolute',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  island: {
    width: '70%',
    height: 210,
    marginBottom: -70,
    zIndex: 1,
  },
  floatingThought: {
    width: 150,
    height: 150,
    zIndex: 2,
    marginBottom: 40,
  },
  miniFloat: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 3,
  },
  textContainer: {
    marginTop: 20,
    marginBottom: 40,
    zIndex: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    lineHeight: 18,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionBtn: {
    width: '80%',
    height: 60,
    alignSelf: 'center',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  dotImage: {
    width: 16,
    height: 16,
    marginHorizontal: 4,
  },
});
