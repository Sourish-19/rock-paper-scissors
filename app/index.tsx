import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useGameStore } from '@/store/gameStore';

export default function Index() {
  const router = useRouter();
  useEffect(() => onAuthStateChanged(auth,user => {
    const store = useGameStore.getState();
    store.setUserSession(user);
    if (user) store.setUserProfile({...store.userProfile,username:user.displayName || store.userProfile.username});
    router.replace(user ? '/home' : '/loading');
  }),[router]);
  return null;
}
