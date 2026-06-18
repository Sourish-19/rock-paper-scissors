import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

export default function RootIndex() {
  const router = useRouter();
  const { userSession } = useGameStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // For now, if no session, go to loading/onboarding. If session, go to home.
    if (userSession) {
      router.replace('/home');
    } else {
      router.replace('/loading');
    }
  }, [userSession, isMounted, router]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4DB8FF',
  },
});
