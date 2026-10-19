import { useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updateProfile, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useGameStore } from '@/store/gameStore';
import { Art, ArtButton, ArtworkDialog, GameCanvas, HeaderDecor, Label, PixelInput, TextLink } from './primitives';
import { claimExistingUsername, isUsernameAvailable, reserveUsername, USERNAME_PATTERN, UsernameTakenError } from './usernames';
import { BackCloud, FrontCloud } from './motion';
import { type Artwork } from './artwork';

type Dialog = { art: Artwork; title?: string; body?: string; created?: boolean };
export function AuthScreen({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const { setUserSession, setUserProfile, userProfile } = useGameStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const labelColor = (field: string) => invalid.includes(field) ? '#d4040b' : '#fff';
  const acceptUser = (user: User) => {
    setUserSession(user);
    // Accounts created before names were reserved claim theirs on sign-in, if it's still free.
    if (!signup) void claimExistingUsername(user.displayName, user.uid);
    setUserProfile({ ...userProfile, username: user.displayName || username.trim() || user.email?.split('@')[0] || 'PLAYER' });
  };
  const showFailure = (error: unknown) => {
    const code = (error as { code?: string }).code;
    if (code === 'auth/network-request-failed') { router.push({ pathname: '/no-internet', params: { returnTo: signup ? '/signup' : '/login' } }); return; }
    if (error instanceof UsernameTakenError) { setInvalid(['username']); setDialog({art:'authentiction_screen/username_taken.png'}); return; }
    if (code === 'auth/email-already-in-use') { setInvalid(['email']); setDialog({ art:'authentiction_screen/username_taken.png', title:'EMAIL TAKEN', body:'THIS EMAIL ADDRESS\nALREADY EXISTS.' }); }
    else if (code === 'auth/weak-password') { setInvalid(['password']); setDialog({art:'authentiction_screen/weak_pass.png'}); }
    else if (code === 'auth/invalid-email' || code === 'auth/user-not-found') { setInvalid(['email']); setDialog({art:'authentiction_screen/login_failed_un.png'}); }
    else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') { setInvalid(['password']); setDialog({art:'authentiction_screen/login_failed_pass.png'}); }
    else if (code === 'auth/operation-not-allowed' || code === 'auth/unauthorized-domain') setDialog({art:'authentiction_screen/missing_info.png',title:'GOOGLE SIGN IN',body:'GOOGLE SIGN IN IS NOT\nAVAILABLE RIGHT NOW.'});
    else if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') setDialog({art:'authentiction_screen/missing_info.png',title:'GOOGLE SIGN IN',body:'ALLOW POP-UPS, OR OPEN\nTHE GAME IN YOUR BROWSER.'});
    else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') router.push({ pathname:'/oops',params:{ returnTo:signup?'/signup':'/login' } });
  };
  const submit = async () => {
    const missing = [...(signup && !username.trim() ? ['username'] : []), ...(!email.trim() ? ['email'] : []), ...(!password ? ['password'] : [])];
    setInvalid(missing);
    // The artwork's baked copy names username + password; spell out the fields this form actually needs.
    if (missing.length) { setDialog({art:'authentiction_screen/missing_info.png',body:signup?'PLEASE ENTER USERNAME,\nEMAIL ID AND PASSWORD.':'PLEASE ENTER EMAIL ID\nAND PASSWORD.'}); return; }
    const name = username.trim();
    if (signup && !USERNAME_PATTERN.test(name)) { setInvalid(['username']); setDialog({art:'authentiction_screen/missing_info.png',title:'USERNAME',body:'USE 3-12 LETTERS,\nNUMBERS OR _ ONLY.'}); return; }
    setBusy(true);
    try {
      if (signup) {
        // Check first (no account is created for a taken name), then reserve atomically once signed in.
        if (!(await isUsernameAvailable(name))) throw new UsernameTakenError();
        const result = await createUserWithEmailAndPassword(auth,email.trim(),password);
        try { await reserveUsername(name, result.user.uid); }
        catch (e) { await result.user.delete().catch(() => {}); throw e; }   // someone took it in the meantime
        await updateProfile(result.user,{displayName:name});
        acceptUser(result.user);
        setDialog({art:'authentiction_screen/account_created.png',created:true});
      } else { const result = await signInWithEmailAndPassword(auth,email.trim(),password); acceptUser(result.user); router.replace('/home'); }
    } catch (e) { showFailure(e); } finally { setBusy(false); }
  };
  const resetPassword = async () => {
    if (!email.trim()) { setInvalid(['email']); setDialog({art:'authentiction_screen/missing_info.png',body:'ENTER YOUR EMAIL FOR\nRESET INSTRUCTIONS.'}); return; }
    setBusy(true);
    try { await sendPasswordResetEmail(auth,email.trim()); setDialog({art:'authentiction_screen/reset_sent.png'}); }
    catch (e) { showFailure(e); } finally { setBusy(false); }
  };
  const google = async () => {
    if (Platform.OS !== 'web') { setDialog({art:'authentiction_screen/missing_info.png',title:'GOOGLE SIGN IN',body:'USE EMAIL SIGN IN\nON THIS DEVICE.'}); return; }
    setBusy(true);
    try { const result = await signInWithPopup(auth,new GoogleAuthProvider()); acceptUser(result.user); router.replace('/home'); }
    catch (e) { showFailure(e); } finally { setBusy(false); }
  };
  return <GameCanvas background="authentiction_screen/Sky.png" keyboard>
    <BackCloud y={150} />
    <HeaderDecor title={signup?'authentiction_screen/sign_up.png':'authentiction_screen/Vector.png'} x={40} y={93} w={313} rockY={48} paperY={90} scissorsY={141} />
    <FrontCloud y={600} />
    {/* Sign-in only needs email + password: its two fields and everything below are spaced to fill the same area. */}
    {signup && <PixelInput label="Username" y={233} value={username} onChangeText={setUsername} error={invalid.includes('username')} maxLength={12} />}
    <PixelInput label="Email address" y={signup?339:262} value={email} onChangeText={setEmail} error={invalid.includes('email')} email />
    <PixelInput label="Password" y={signup?445:384} value={password} onChangeText={setPassword} error={invalid.includes('password')} secure />
    {signup && <Label x={58} y={220} w={285} h={24} size={16} outline={2} shadow={false} align="left" color={labelColor('username')}>USERNAME</Label>}
    <Label x={58} y={signup?326:249} w={285} h={24} size={16} outline={2} shadow={false} align="left" color={labelColor('email')}>EMAIL ID</Label>
    <Label x={58} y={signup?432:371} w={285} h={24} size={16} outline={2} shadow={false} align="left" color={labelColor('password')}>PASSWORD</Label>
    {!signup && <TextLink title="Forgot Password?" x={150} y={463} w={201} size={10} align="right" onPress={resetPassword} />}
    <ArtButton asset="authentiction_screen/button.png" x={43} y={signup?537:510} w={306.25} title={busy?'PLEASE WAIT...':signup?'SIGN UP':'SIGN IN'} disabled={busy} onPress={submit} />
    <Label x={160} y={signup?628:607} w={73} size={15}>OR</Label>
    {signup && <><Label x={50} y={626} w={114} size={16}>-------</Label><Label x={227} y={626} w={114} size={16}>-------</Label></>}
    <ArtButton asset="authentiction_screen/button.png" x={43} y={signup?669:654} w={306.25} disabled={busy} accessibilityLabel="Sign in with Google" onPress={google}>
      <Label x={22} y={22} w={231} size={16}>SIGN IN WITH</Label>
      <Art asset="authentiction_screen/GOOGLE LOGO.png" x={243} y={23} w={26} />
    </ArtButton>
    <TextLink title={signup?'Already have an account?\nSign In':'Create Account'} x={20} y={signup?760:756} w={353} size={12} onPress={()=>router.replace(signup?'/login':'/signup')} />
    {dialog && <ArtworkDialog asset={dialog.art} title={dialog.title} body={dialog.body} continueButton={dialog.created} onClose={()=>{setDialog(null);if(dialog.created)router.replace('/gender');}} />}
  </GameCanvas>;
}
