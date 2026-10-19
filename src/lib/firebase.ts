import { initializeApp, getApp, getApps } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBbJStjaM4xvoWgFaIXuEvibfmxRebQDjU",
  authDomain: "rock-paper-scissors-8e52b.firebaseapp.com",
  projectId: "rock-paper-scissors-8e52b",
  storageBucket: "rock-paper-scissors-8e52b.firebasestorage.app",
  messagingSenderId: "997687220059",
  appId: "1:997687220059:web:fe73ba7100ed4becb86c7e",
  measurementId: "G-PJWTRHXTT2"
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: any;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);

export { auth, db };
