import React, { useRef, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        <View style={[styles.page, { width }]}>
          <PixelText style={styles.title}>WELCOME</PixelText>
          <Text style={styles.subtitle}>Get ready for an epic battle of Rock Paper Scissors.</Text>
          <View style={{ marginTop: 40, width: '100%', paddingHorizontal: 24 }}>
            <RetroButton title="NEXT" onPress={handleNext} backgroundColor="#FFDE4D" />
          </View>
        </View>
        <View style={[styles.page, { width }]}>
          <PixelText style={styles.title}>RULES</PixelText>
          <Text style={styles.subtitle}>Rock crushes Scissors. Scissors cuts Paper. Paper covers Rock.</Text>
          <View style={{ marginTop: 40, width: '100%', paddingHorizontal: 24 }}>
            <RetroButton title="NEXT" onPress={handleNext} backgroundColor="#FFDE4D" />
          </View>
        </View>
        <View style={[styles.page, { width }]}>
          <PixelText style={styles.title}>BATTLE!</PixelText>
          <Text style={styles.subtitle}>Defeat the bot or challenge friends!</Text>
          <View style={{ marginTop: 40, width: '100%', paddingHorizontal: 24 }}>
            <RetroButton
              title="GET STARTED"
              onPress={() => router.replace('/login')}
              backgroundColor="#FFDE4D"
            />
          </View>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentPage === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4DB8FF',
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
    fontSize: 12,
    lineHeight: 20,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  activeDot: {
    backgroundColor: '#FFDE4D',
  },
  inactiveDot: {
    backgroundColor: '#FFFFFF',
  },
});
