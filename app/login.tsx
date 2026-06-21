import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, Pressable, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useGameStore } from '@/store/gameStore';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

export default function LoginScreen() {
  const router = useRouter();
  const { setUserSession, setUserProfile, userProfile } = useGameStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUserSession(userCredential.user);
      if (userCredential.user.displayName) {
        setUserProfile({ ...userProfile, username: userCredential.user.displayName });
      }
      setLoading(false);
      router.replace('/home');
    } catch (error: any) {
      console.error('Login Error:', error);
      setErrorMessage(error.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <PixelText style={styles.titleText}>LOGIN</PixelText>
        </View>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <Text style={{ color: 'red', fontFamily: 'PressStart2P_400Regular', fontSize: 10, marginBottom: 10, textAlign: 'center' }}>
              {errorMessage}
            </Text>
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.buttonWrapper}>
            <RetroButton
              title={loading ? "WAIT..." : "LOG IN"}
              onPress={handleLogin}
              backgroundColor="#FFDE4D"
            />
          </View>

          <Pressable onPress={() => router.push('/signup')} style={styles.signupLink}>
            <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupBold}>SIGN UP</Text></Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#4DB8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleText: {
    fontSize: 32,
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#000000',
  },
  buttonWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  signupLink: {
    alignItems: 'center',
    padding: 10,
  },
  signupText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#FFFFFF',
  },
  signupBold: {
    color: '#FFDE4D',
    textDecorationLine: 'underline',
  },
});
