import { initializeApp, getApp, getApps } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBGR4d_8MmKEZ84wHQKtPyEcoynvwsFNso",
  authDomain: "rock-paper-scissors-bolte.firebaseapp.com",
  projectId: "rock-paper-scissors-bolte",
  storageBucket: "rock-paper-scissors-bolte.firebasestorage.app",
  messagingSenderId: "665416890839",
  appId: "1:665416890839:web:211e356f7e10f062b1f392",
  measurementId: "G-R8H6WQN1XE"
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
