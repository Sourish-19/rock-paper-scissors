import { Stack } from 'expo-router';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MusicProvider } from '@/components/MusicProvider';
import { preloadArtwork } from '@/ui/preload';
import '../src/ui/global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});
// Screens crossfade natively on phones (both ways); on web each screen fades itself in (see GameCanvas).
export default function RootLayout() {
  const [loaded, error] = useFonts({ PressStart2P_400Regular });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync(); }, [loaded,error]);
  // Start fetching all artwork straight away, in the background, so later screens open fully drawn.
  useEffect(() => { preloadArtwork(); }, []);
  if (!loaded && !error) return null;
  return <SafeAreaProvider><MusicProvider><Stack screenOptions={{ headerShown:false, animation: Platform.OS === 'web' ? 'none' : 'fade', animationDuration: 260, contentStyle:{backgroundColor:'#0087ed'} }} /></MusicProvider></SafeAreaProvider>;
}
