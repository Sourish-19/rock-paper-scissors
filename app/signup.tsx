import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, Pressable, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { RetroButton } from '@/components/RetroButton';
import { PixelText } from '@/components/PixelText';

export default function SignupScreen() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (error) {
      Alert.alert('Signup Failed', error.message);
      setLoading(false);
    } else {
      Alert.alert('Success', 'Account created! Please log in.');
      setLoading(false);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <PixelText style={styles.titleText}>SIGN UP</PixelText>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
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
              title={loading ? "WAIT..." : "SIGN UP"}
              onPress={handleSignup}
              backgroundColor="#FFDE4D"
            />
          </View>

          <Pressable onPress={() => router.replace('/login')} style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>LOG IN</Text></Text>
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
  loginLink: {
    alignItems: 'center',
    padding: 10,
  },
  loginText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#FFFFFF',
  },
  loginBold: {
    color: '#FFDE4D',
    textDecorationLine: 'underline',
  },
});
