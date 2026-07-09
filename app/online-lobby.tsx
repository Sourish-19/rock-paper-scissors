import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Pressable, TextInput, ImageBackground, Clipboard, Text, Dimensions, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { PixelText } from '@/components/PixelText';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function OnlineLobbyScreen() {
  const router = useRouter();
  const { userProfile, userSession, matchState } = useGameStore();
  const maxRounds = matchState.maxRounds || 3;

  const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [errorText, setErrorText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('COPY CODE');

  // Persist guest UID across re-renders
  const myUidRef = useRef<string>('');
  if (!myUidRef.current) {
    myUidRef.current = userSession?.uid || 'user_' + Math.random().toString(36).substr(2, 9);
  }
  const myUid = myUidRef.current;

  const isHost = roomData?.creator?.uid === myUid;

  // Generate 6-digit room code
  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 1. Create Room handler
  const handleCreateRoom = async () => {
    const code = generateRoomCode();
    setErrorText('');

    try {
      const roomRef = doc(db, 'rooms', code);
      const newRoom = {
        roomId: code,
        status: 'waiting',
        maxRounds,
        currentRound: 1,
        creator: {
          uid: myUid,
          username: userProfile.username || 'Host',
          gender: userProfile.gender || 'male',
          score: 0,
        },
        joiner: null,
        roundChoices: {},
        roundWinners: {},
        exits: { creatorExited: false, joinerExited: false },
        createdAt: Date.now(),
      };

      await setDoc(roomRef, newRoom);
      setRoomCode(code);
      setMode('create');
    } catch (e: any) {
      console.error('Error creating room:', e);
      setErrorText('FAILED TO CREATE ROOM');
      Alert.alert('ROOM ERROR', e.message || String(e));
    }
  };

  // 2. Join Room handler
  const handleJoinRoom = async () => {
    setErrorText('');
    const code = inputCode.trim();
    if (code.length !== 6) {
      setErrorText('ENTER 6-DIGIT CODE');
      return;
    }

    try {
      const roomRef = doc(db, 'rooms', code);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        setErrorText('ROOM NOT FOUND');
        return;
      }

      const data = roomSnap.data();
      if (data.status !== 'waiting' || data.joiner !== null) {
        setErrorText('ROOM IS FULL OR PLAYING');
        return;
      }

      // Add joiner to room in Firestore
      await updateDoc(roomRef, {
        joiner: {
          uid: myUid,
          username: userProfile.username || 'Guest',
          gender: userProfile.gender || 'male',
          score: 0,
        },
        status: 'ready',
      });

      setRoomCode(code);
      setMode('join');
    } catch (e: any) {
      console.error('Error joining room:', e);
      setErrorText('FAILED TO JOIN ROOM');
      Alert.alert('JOIN ERROR', e.message || String(e));
    }
  };

  // 3. Start Match handler (Host only)
  const handleStartMatch = async () => {
    if (!roomCode) return;
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        status: 'playing',
      });
    } catch (e) {
      console.error('Error starting match:', e);
    }
  };

  // 4. Leave Room handler
  const handleLeaveRoom = async () => {
    if (roomCode) {
      try {
        const roomRef = doc(db, 'rooms', roomCode);
        if (isHost) {
          // If host leaves, delete the room
          await deleteDoc(roomRef);
        } else {
          // If guest leaves, remove guest and reset room to waiting
          await updateDoc(roomRef, {
            joiner: null,
            status: 'waiting',
          });
        }
      } catch (e) {
        console.warn('Error cleanup on leave:', e);
      }
    }
    setRoomCode('');
    setInputCode('');
    setRoomData(null);
    setMode('selection');
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!roomCode) return;
    Clipboard.setString(roomCode);
    setCopyFeedback('COPIED!');
    setTimeout(() => setCopyFeedback('COPY CODE'), 2000);
  };

  // Listen to Firestore Room updates
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = doc(db, 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRoomData(data);

        // If status becomes 'playing', route to multiplayer match screen
        if (data.status === 'playing') {
          router.replace({
            pathname: '/game/multiplayer' as any,
            params: { roomId: roomCode, myUid }
          });
        }
      } else {
        // If room is deleted (e.g. host closed it), route guest out
        if (mode === 'join') {
          setErrorText('HOST CLOSED THE ROOM');
          setTimeout(() => {
            setRoomCode('');
            setInputCode('');
            setRoomData(null);
            setMode('selection');
          }, 2000);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  return (
    <ImageBackground
      source={require('../assets/online_duel_screen/Sky.png')}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          
          {/* Top Header Title */}
          <View style={styles.header}>
            <Image
              source={require('../assets/online_duel_screen/online_duel_vector.png')}
              style={styles.headerTitle}
              contentFit="contain"
            />
          </View>

          {/* Selection mode */}
          {mode === 'selection' && (
            <View style={styles.content}>
              {errorText ? (
                <PixelText fillColor="#FF0000" strokeColor="#000000" style={styles.errorLabel}>
                  {errorText}
                </PixelText>
              ) : null}
              <Pressable onPress={handleCreateRoom} style={({ pressed }) => [styles.menuBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                <ImageBackground
                  source={require('../assets/online_duel_screen/create_room_button.png')}
                  style={styles.menuBtnBg}
                  imageStyle={{ resizeMode: 'stretch' }}
                >
                  <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.menuBtnText}>CREATE ROOM</PixelText>
                </ImageBackground>
              </Pressable>

              <Pressable onPress={() => setMode('join')} style={({ pressed }) => [styles.menuBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                <ImageBackground
                  source={require('../assets/online_duel_screen/roin_room_button.png')}
                  style={styles.menuBtnBg}
                  imageStyle={{ resizeMode: 'stretch' }}
                >
                  <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.menuBtnText}>JOIN ROOM</PixelText>
                </ImageBackground>
              </Pressable>

              <Pressable onPress={() => router.replace('/home')} style={({ pressed }) => [styles.menuBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                <ImageBackground
                  source={require('../assets/online_duel_screen/leave_room_button.png')}
                  style={styles.menuBtnBg}
                  imageStyle={{ resizeMode: 'stretch' }}
                >
                  <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.menuBtnText}>BACK TO MENU</PixelText>
                </ImageBackground>
              </Pressable>
            </View>
          )}

          {/* Join room input mode */}
          {mode === 'join' && !roomCode && (
            <View style={styles.content}>
              <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.inputLabel}>
                ENTER ROOM CODE:
              </PixelText>

              <ImageBackground
                source={require('../assets/online_duel_screen/room_input_box.png')}
                style={styles.inputBoxBg}
                imageStyle={{ resizeMode: 'stretch' }}
              >
                <TextInput
                  style={styles.roomInput}
                  placeholder="CODE"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={inputCode}
                  onChangeText={setInputCode}
                />
              </ImageBackground>

              {errorText ? (
                <PixelText fillColor="#FF0000" strokeColor="#000000" style={styles.errorLabel}>
                  {errorText}
                </PixelText>
              ) : null}

              <View style={styles.buttonsRow}>
                <Pressable onPress={handleJoinRoom} style={({ pressed }) => [styles.halfBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                  <ImageBackground
                    source={require('../assets/online_duel_screen/join_button.png')}
                    style={styles.halfBtnBg}
                    imageStyle={{ resizeMode: 'stretch' }}
                  >
                    <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.halfBtnText}>JOIN</PixelText>
                  </ImageBackground>
                </Pressable>

                <Pressable onPress={() => setMode('selection')} style={({ pressed }) => [styles.halfBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                  <ImageBackground
                    source={require('../assets/online_duel_screen/copy_button.png')}
                    style={styles.halfBtnBg}
                    imageStyle={{ resizeMode: 'stretch' }}
                  >
                    <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.halfBtnText}>CANCEL</PixelText>
                  </ImageBackground>
                </Pressable>
              </View>
            </View>
          )}

          {/* Lobby Waiting Room (for both Host & Guest) */}
          {roomCode && (mode === 'create' || mode === 'join') && (
            <View style={styles.lobbyContent}>
              
              {/* Room ready vs Waiting header */}
              <View style={styles.statusHeaderContainer}>
                {roomData?.status === 'ready' ? (
                  <Image
                    source={require('../assets/online_duel_screen/room_ready.png')}
                    style={styles.roomReadyHeader}
                    contentFit="contain"
                  />
                ) : (
                  <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.waitingLabel}>
                    WAITING FOR OPPONENT...
                  </PixelText>
                )}
              </View>

              {/* Room Code Info Box */}
              <View style={styles.codeContainer}>
                <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.codeText}>
                  ROOM: {roomCode}
                </PixelText>
                
                <Pressable onPress={handleCopyCode} style={({ pressed }) => [styles.copyBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                  <ImageBackground
                    source={require('../assets/online_duel_screen/copy_button.png')}
                    style={styles.copyBtnBg}
                    imageStyle={{ resizeMode: 'stretch' }}
                  >
                    <Image source={require('../assets/online_duel_screen/copy_icon.png')} style={styles.copyIcon} contentFit="contain" />
                    <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.copyBtnText}>
                      {copyFeedback}
                    </PixelText>
                  </ImageBackground>
                </Pressable>
              </View>

              {/* Players Panel (1v1 Card) */}
              <ImageBackground
                source={require('../assets/online_duel_screen/1v1_box.png')}
                style={styles.versusBox}
                imageStyle={{ resizeMode: 'stretch' }}
              >
                <View style={styles.playersPanel}>
                  
                  {/* Host profile player */}
                  <View style={styles.playerWrapper}>
                    <Image
                      source={roomData?.creator?.gender === 'female'
                        ? require('../assets/online_duel_screen/female_player.png')
                        : require('../assets/online_duel_screen/male_player.png')}
                      style={styles.playerAvatar}
                      contentFit="contain"
                    />
                    <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.playerName}>
                      {roomData?.creator?.username || 'HOST'}
                    </PixelText>
                  </View>

                  {/* VS blocks spacer */}
                  <PixelText fillColor="#FFDE4D" strokeColor="#000000" style={styles.vsLabel}>VS</PixelText>

                  {/* Guest profile player */}
                  <View style={styles.playerWrapper}>
                    {roomData?.joiner ? (
                      <>
                        <Image
                          source={roomData.joiner.gender === 'female'
                            ? require('../assets/online_duel_screen/female_player.png')
                            : require('../assets/online_duel_screen/male_player.png')}
                          style={styles.playerAvatar}
                          contentFit="contain"
                        />
                        <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.playerName}>
                          {roomData.joiner.username}
                        </PixelText>
                      </>
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <PixelText fillColor="#666666" strokeColor="transparent" style={styles.placeholderLabel}>?</PixelText>
                      </View>
                    )}
                  </View>
                </View>
              </ImageBackground>

              {/* Error Message */}
              {errorText ? (
                <PixelText fillColor="#FF0000" strokeColor="#000000" style={styles.errorLabel}>
                  {errorText}
                </PixelText>
              ) : null}

              {/* Action buttons */}
              <View style={styles.actionButtonsContainer}>
                {isHost && roomData?.status === 'ready' ? (
                  <Pressable onPress={handleStartMatch} style={({ pressed }) => [styles.actionBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                    <ImageBackground
                      source={require('../assets/online_duel_screen/start_match_button.png')}
                      style={styles.menuBtnBg}
                      imageStyle={{ resizeMode: 'stretch' }}
                    >
                      <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.menuBtnText}>START MATCH</PixelText>
                    </ImageBackground>
                  </Pressable>
                ) : null}

                <Pressable onPress={handleLeaveRoom} style={({ pressed }) => [styles.actionBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
                  <ImageBackground
                    source={require('../assets/online_duel_screen/leave_room_button.png')}
                    style={styles.menuBtnBg}
                    imageStyle={{ resizeMode: 'stretch' }}
                  >
                    <PixelText fillColor="#FFFFFF" strokeColor="#000000" style={styles.menuBtnText}>LEAVE LOBBY</PixelText>
                  </ImageBackground>
                </Pressable>
              </View>

            </View>
          )}

        </ScrollView>
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 45,
    marginBottom: 10,
    zIndex: 2,
  },
  headerTitle: {
    width: 250,
    height: 100,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
    marginVertical: 40,
  },
  menuBtn: {
    width: 280,
    height: 67,
  },
  menuBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBtnText: {
    fontSize: 12,
  },
  inputLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  inputBoxBg: {
    width: 280,
    height: 66,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  roomInput: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    outlineStyle: 'none',
    paddingHorizontal: 0,
    paddingVertical: 0,
  } as any,
  buttonsRow: {
    flexDirection: 'row',
    width: 280,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  halfBtn: {
    width: 130,
    height: 65,
  },
  halfBtnBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfBtnText: {
    fontSize: 12,
  },
  errorLabel: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 10,
    color: '#FF0000',
  },
  lobbyContent: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
    marginVertical: 20,
  },
  statusHeaderContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomReadyHeader: {
    width: 260,
    height: 65,
  },
  waitingLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    width: 280,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 8,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 10,
  },
  copyBtn: {
    width: 110,
    height: 44,
  },
  copyBtnBg: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  copyIcon: {
    width: 12,
    height: 14,
  },
  copyBtnText: {
    fontSize: 7,
  },
  versusBox: {
    width: 300,
    height: 135,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  playersPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  playerWrapper: {
    alignItems: 'center',
    width: '40%',
  },
  playerAvatar: {
    width: 50,
    height: 70,
    marginBottom: 6,
  },
  playerName: {
    fontSize: 8,
    textAlign: 'center',
  },
  vsLabel: {
    fontSize: 14,
  },
  avatarPlaceholder: {
    width: 50,
    height: 70,
    borderWidth: 2,
    borderColor: '#666666',
    borderStyle: 'dashed',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  placeholderLabel: {
    fontSize: 18,
  },
  actionButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
    marginTop: 10,
  },
  actionBtn: {
    width: 280,
    height: 67,
  },
});
