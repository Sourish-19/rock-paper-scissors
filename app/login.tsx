import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, Pressable, Text, Alert, ImageBackground, Modal, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useGameStore } from '@/store/gameStore';
import { PixelText } from '@/components/PixelText';

const { width, height } = Dimensions.get('window');

const InputField = ({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, hasError }: any) => {
  return (
    <ImageBackground
      source={hasError 
        ? require('../assets/authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png') 
        : require('../assets/authentiction_screen/PASSWORD TEXT INPUT BOX.png')
      }
      style={styles.inputWrapper}
      resizeMode="stretch"
    >
      <TextInput
        style={styles.textInputInside}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        autoComplete="off"
      />
    </ImageBackground>
  );
};

const AuthButton = ({ onPress, title, loading }: any) => {
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [
      styles.buttonContainer,
      pressed && { transform: [{ translateY: 4 }] }
    ]}>
      <ImageBackground
        source={require('../assets/authentiction_screen/button.png')}
        style={styles.buttonBg}
        resizeMode="stretch"
      >
        <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.buttonText}>
          {loading ? "WAIT..." : title}
        </PixelText>
      </ImageBackground>
    </Pressable>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const { setUserSession, setUserProfile, userProfile } = useGameStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);

  const handleLogin = async () => {
    setEmailError(false);
    setPasswordError(false);
    
    let hasError = false;
    if (!email) {
      setEmailError(true);
      hasError = true;
    }
    if (!password) {
      setPasswordError(true);
      hasError = true;
    }
    
    if (hasError) {
      setErrorType('missing_info');
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
      const code = error.code;
      if (code === 'auth/wrong-password') {
        setPasswordError(true);
        setErrorType('login_failed_pass');
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setEmailError(true);
        setErrorType('login_failed_un');
      } else {
        setEmailError(true);
        setPasswordError(true);
        setErrorType('login_failed_un');
      }
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/authentiction_screen/Sky.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        
        {/* Floating clouds in background */}
        <Image 
          source={require('../assets/general/cloud_1.png')} 
          style={[styles.cloud, { top: height * 0.1, left: -20, width: 140, height: 70 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { top: height * 0.05, right: 10, width: 100, height: 50 }]} 
          contentFit="contain" 
        />
        
        {/* Floating hand elements */}
        <Image 
          source={require('../assets/authentiction_screen/Paper.png')} 
          style={[styles.floatingHand, { top: '15%', left: '10%' }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/authentiction_screen/Scissors.png')} 
          style={[styles.floatingHand, { top: '12%', right: '8%' }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/authentiction_screen/Stone.png')} 
          style={[styles.floatingHand, { bottom: '15%', right: '12%' }]} 
          contentFit="contain" 
        />

        <View style={styles.titleContainer}>
          <Image
            source={require('../assets/authentiction_screen/Vector.png')}
            style={styles.titleImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            hasError={emailError}
          />
          <InputField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            hasError={passwordError}
          />

          <AuthButton
            title="LOG IN"
            onPress={handleLogin}
            loading={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable 
            onPress={() => Alert.alert('Google Sign-In', 'Google sign-in is not configured.')}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && { transform: [{ translateY: 2 }] }
            ]}
          >
            <Image 
              source={require('../assets/authentiction_screen/GOOGLE LOGO.png')} 
              style={styles.googleIcon} 
              contentFit="contain" 
            />
            <PixelText fillColor="#000000" strokeColor="transparent" style={styles.googleButtonText}>
              SIGN IN WITH GOOGLE
            </PixelText>
          </Pressable>

          <Pressable onPress={() => router.push('/signup')} style={styles.signupLink}>
            <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupBold}>SIGN UP</Text></Text>
          </Pressable>
        </View>

        {/* Error Popup Modal */}
        {errorType && (
          <Modal transparent visible={!!errorType} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ImageBackground
                  source={
                    errorType === 'missing_info' ? require('../assets/authentiction_screen/missing_info.png') :
                    errorType === 'login_failed_un' ? require('../assets/authentiction_screen/login_failed_un.png') :
                    errorType === 'login_failed_pass' ? require('../assets/authentiction_screen/login_failed_pass.png') :
                    require('../assets/authentiction_screen/missing_info.png')
                  }
                  style={styles.popupBg}
                  resizeMode="contain"
                >
                  <Pressable 
                    onPress={() => setErrorType(null)}
                    style={({ pressed }) => [
                      styles.popupOkBtn,
                      pressed && { transform: [{ translateY: 2 }] }
                    ]}
                  >
                    <ImageBackground
                      source={require('../assets/authentiction_screen/ok_button.png')}
                      style={styles.okBtnBg}
                      resizeMode="stretch"
                    >
                      <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.okBtnText}>
                        OK
                      </PixelText>
                    </ImageBackground>
                  </Pressable>
                </ImageBackground>
              </View>
            </View>
          </Modal>
        )}

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  cloud: {
    position: 'absolute',
    opacity: 0.8,
  },
  floatingHand: {
    position: 'absolute',
    width: 60,
    height: 60,
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 2,
  },
  titleImage: {
    width: 280,
    height: 60,
  },
  formContainer: {
    width: '100%',
    zIndex: 2,
  },
  inputWrapper: {
    width: '100%',
    height: 64,
    marginBottom: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  textInputInside: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#000000',
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  } as any,
  buttonContainer: {
    width: '100%',
    height: 60,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#000000',
  },
  dividerText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#000000',
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 10,
  },
  signupLink: {
    alignItems: 'center',
    padding: 10,
  },
  signupText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000000',
  },
  signupBold: {
    color: '#FFDE4D',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 360,
    aspectRatio: 1448 / 615,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  popupOkBtn: {
    width: '45%',
    aspectRatio: 673 / 289,
    marginBottom: 8,
  },
  okBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  okBtnText: {
    fontSize: 10,
  },
});
