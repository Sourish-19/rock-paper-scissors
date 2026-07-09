import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text, Alert, ImageBackground, Modal, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
      imageStyle={{ resizeMode: 'stretch' }}
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

export default function SignupScreen() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);

  const handleSignup = async () => {
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);
    
    let hasError = false;
    if (!username) {
      setUsernameError(true);
      hasError = true;
    }
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: username });
      }
      setLoading(false);
      setErrorType('account_created'); // Show account created success modal
    } catch (error: any) {
      console.error('Signup Error:', error);
      const code = error.code;
      if (code === 'auth/email-already-in-use') {
        setEmailError(true);
        setErrorType('username_taken');
      } else if (code === 'auth/weak-password') {
        setPasswordError(true);
        setErrorType('weak_pass');
      } else {
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
          style={[styles.cloud, { top: height * 0.08, right: -10, width: 130, height: 65 }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/general/cloud_2.png')} 
          style={[styles.cloud, { top: height * 0.15, left: 10, width: 110, height: 55 }]} 
          contentFit="contain" 
        />
        
        {/* Floating hand elements */}
        <Image 
          source={require('../assets/authentiction_screen/Paper.png')} 
          style={[styles.floatingHand, { top: '15%', right: '12%' }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/authentiction_screen/Scissors.png')} 
          style={[styles.floatingHand, { top: '10%', left: '8%' }]} 
          contentFit="contain" 
        />
        <Image 
          source={require('../assets/authentiction_screen/Stone.png')} 
          style={[styles.floatingHand, { bottom: '15%', left: '10%' }]} 
          contentFit="contain" 
        />

        <View style={styles.titleContainer}>
          <Image
            source={require('../assets/authentiction_screen/sign_up.png')}
            style={styles.titleImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <InputField
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            hasError={usernameError}
          />
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
            title="SIGN UP"
            onPress={handleSignup}
            loading={loading}
          />

          <Pressable onPress={() => router.replace('/login')} style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>LOG IN</Text></Text>
          </Pressable>
        </View>

        {/* Custom Status/Error Popup Modal */}
        {errorType && (
          <Modal transparent visible={!!errorType} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                 <ImageBackground
                  source={
                    errorType === 'missing_info' ? require('../assets/authentiction_screen/missing_info.png') :
                    errorType === 'username_taken' ? require('../assets/authentiction_screen/username_taken.png') :
                    errorType === 'weak_pass' ? require('../assets/authentiction_screen/weak_pass.png') :
                    errorType === 'account_created' ? require('../assets/authentiction_screen/account_created.png') :
                    require('../assets/authentiction_screen/missing_info.png')
                  }
                  style={styles.popupBg}
                  imageStyle={{ resizeMode: 'stretch' }}
                >
                  <Pressable 
                    onPress={() => {
                      if (errorType === 'account_created') {
                        setErrorType(null);
                        router.replace('/login');
                      } else {
                        setErrorType(null);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.popupOkBtn,
                      pressed && { transform: [{ translateY: 2 }] }
                    ]}
                  >
                    <ImageBackground
                      source={require('../assets/authentiction_screen/ok_button.png')}
                      style={styles.okBtnBg}
                      imageStyle={{ resizeMode: 'stretch' }}
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
    width: '100%',
    alignSelf: 'center',
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
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  loginLink: {
    alignItems: 'center',
    padding: 10,
  },
  loginText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000000',
  },
  loginBold: {
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
    width: 300,
    height: 165,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  popupOkBtn: {
    width: 120,
    height: 48,
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
