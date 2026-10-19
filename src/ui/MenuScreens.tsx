import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useGameStore } from '@/store/gameStore';
import { useMusic } from '@/components/MusicProvider';
import { AnchorBottom, Art, ArtButton, ArtworkDialog, BackButton, box, CANVAS, Dimmer, GameCanvas, HeaderDecor, Label, PixelEditable, TextLink, focusAtEnd, Enter } from './primitives';
import { reserveUsername, USERNAME_PATTERN, UsernameTakenError } from './usernames';
import { BackCloud, BurstSprite, DriftingCloud, FrontCloud, HomeIsland, HoveringIsland, useBurst } from './motion';

export function LoadingScreen() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const pulse = setInterval(() => setTick(t => (t + 1) % 3), 400);
    const next = setTimeout(() => router.replace('/onboarding'), 2400);
    return () => { clearInterval(pulse); clearTimeout(next); };
  }, [router]);
  return <GameCanvas background="loading_screen/Sky.png">
    <BackCloud y={238} />
    <FrontCloud x={-178} y={524} flip={false} />
    {/* 40px text as in the design; the second dot sits 25px after the first. */}
    <Label x={35} y={356} w={330} h={60} size={40} outline={2} align="left">LOADING.</Label>
    <Label x={340} y={356} w={50} h={60} size={40} outline={2} align="left">.</Label>
    <Art asset="loading_screen/Stone.png" x={69} y={428 + (tick === 0 ? -3 : 0)} w={52.75} />
    <Art asset="loading_screen/Paper.png" x={162} y={443 + (tick === 1 ? -3 : 0)} w={40.5} />
    <Art asset="loading_screen/Scissors.png" x={242} y={419 + (tick === 2 ? -3 : 0)} w={42.75} />
  </GameCanvas>;
}


export function OnboardingScreen() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const titles = ['WELCOME TO\nROCK PAPER SCISSORS', 'CHALLENGE FRIENDS\nANYWHERE', 'WIN DUELS.\nBUILD YOUR STREAK.'];
  const copy = ['The classic game you love,\nnow online!', 'Create a room and share the code\nor join with a code from your friend.\nStart your duel instantly!', 'Keep winning to grow your streak\nand prove your skills!'];
  return <GameCanvas background="onboarding_screen/Sky.png" statusBar="dark">
    <Art asset="onboarding_screen/Exclude.png" x={0} y={0} w={393} />
    <DriftingCloud asset="general/cloud_2.png" x={-108} y={238} w={225} speed={25} />
    {/* Each onboarding slide's island and art slides in from the right. */}
    <Enter key={slide} from="right" distance={28}>
    <HoveringIsland>
    <Art asset={slide === 0 ? 'onboarding_screen/floating_island_1.png' : slide === 1 ? 'onboarding_screen/floating_island_2.png' : 'onboarding_screen/floating_island_3.png'} x={28} y={353} w={337} />
    {slide === 0 ? <>
      <Art asset="home_screen/SMILE_GUY.png" x={136} y={220} w={121} />
      <Art asset="onboarding_screen/hand_thought.png" x={164} y={149} w={64.75} />
      <Art asset="loading_screen/Stone.png" x={62} y={352} w={57} />
      <Art asset="loading_screen/Scissors.png" x={277} y={350} w={30} />
    </> : slide === 1 ? <>
      <Art asset="onboarding_screen/duel_sword.png" x={139} y={272} w={115} />
      <Art asset="onboarding_screen/vs_thought.png" x={164} y={201} w={64.75} />
    </> : <>
      <Art asset="onboarding_screen/CROWN_BLOCKS.png" x={166} y={329} w={61.75} />
      <Art asset="onboarding_screen/question_thought.png" x={164} y={254} w={64.75} />
    </>}
    </HoveringIsland>
    </Enter>
    <DriftingCloud asset="general/cloud_1.png" x={302} y={344} w={320} speed={30} direction="left" />
    {[0,1,2].map(i => <View key={i}>
      <Art asset="onboarding_screen/dot_unfilled.png" x={155+i*32} y={497} w={20} />
      {slide === i && <Enter from="fade" duration={220}><Art asset="onboarding_screen/dot_fil.png" x={159+i*32} y={501} w={12} /></Enter>}
    </View>)}
    <Enter key={`text-${slide}`} from="right" distance={28} delay={60}>
      <Label x={18} y={537} w={357} h={56} size={16} color="#ffda00" outline={2}>{titles[slide]}</Label>
      <Label x={20} y={605} w={353} h={70} size={8} outline={1} style={{ lineHeight: 17.5 }}>{copy[slide]}</Label>
    </Enter>
    {slide > 0 && <TextLink title="Skip" x={20} y={789} w={62} size={12} underline={false} onPress={() => router.replace('/login')} />}
    <ArtButton asset="onboarding_screen/next_button.png" x={320} y={779} w={46} accessibilityLabel={slide === 2 ? 'Get started' : 'Next slide'} onPress={() => slide === 2 ? router.replace('/login') : setSlide(slide+1)} />
  </GameCanvas>;
}

export function HomeScreen() {
  const router = useRouter();
  const { userProfile, setGameMode, resetScore, winStreak } = useGameStore();
  // Solo picks its length first; online goes to the lobby, where only the host picks it (when creating a room).
  const play = (mode: 'single' | 'multi') => { setGameMode(mode); resetScore(); router.push(mode === 'multi' ? '/online-lobby' : { pathname: '/game-mode', params: { mode } }); };
  return <GameCanvas background="home_screen/Sky.png">
    <Art asset="home_screen/profile_holder.png" x={27} y={26} w={117.75} />
    <Art asset={userProfile.gender === 'female' ? 'home_screen/female_profile_pic.png' : 'home_screen/male_profile_pic.png'} x={34} y={35} w={31} />
    <Label x={73} y={36} w={65} h={14} size={Math.min(7, 65 / Math.max(userProfile.username.length, 1))} outline={1} strokeBoost={0} shadow={false}>{userProfile.username.toUpperCase()}</Label>
    <Art asset="home_screen/CROWN BLOCKS.png" x={90} y={54} w={13.25} />
    <Label x={108} y={55} w={28} h={13} size={8} outline={1} strokeBoost={0} shadow={false}>{winStreak}</Label>
    <Art asset="home_screen/logo.png" x={24} y={79} w={345} />
    {/* Island, character, crumbles and clouds sit 40px higher than the design and the buttons 20px lower, so all three crumbles float clear of the buttons. */}
    <HomeIsland character={userProfile.gender === 'female' ? 'home_screen/SMILE_GIRL.png' : 'home_screen/SMILE_GUY.png'} />
    <ArtButton asset="home_screen/game_button.png" x={73} y={660} w={253} title="SOLO CHALLENGE" size={16} onPress={() => play('single')} />
    <ArtButton asset="home_screen/game_button.png" x={73} y={739} w={253} title="ONLINE DUEL" size={16} onPress={() => play('multi')} />
    {/* Drawn last so the hovering island and drifting clouds can never cover it. */}
    <ArtButton asset="home_screen/Settings Button.png" x={320} y={26} w={46} accessibilityLabel="Settings" onPress={() => router.push('/settings')} />
  </GameCanvas>;
}

export function GameModeScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { setMaxRounds, setGameMode, setPendingRoomRounds } = useGameStore();
  const choose = (rounds: number) => {
    setMaxRounds(rounds); setGameMode(mode === 'multi' ? 'multi' : 'single');
    if (mode !== 'multi') { router.push('/game'); return; }
    // Online: hand the choice back to the lobby, which creates the room with it.
    setPendingRoomRounds(rounds);
    if (router.canGoBack()) router.back(); else router.replace('/online-lobby');
  };
  return <GameCanvas background="game_mode_screen/Sky.png">
    <BackCloud y={150} />
    <BackButton onPress={() => router.canGoBack() ? router.back() : router.replace(mode === 'multi' ? '/online-lobby' : '/home')} />
    <Art asset="game_mode_screen/Stone.png" x={9} y={176} w={84.75} />
    <Art asset="game_mode_screen/select_game_mode.png" x={40} y={227} w={313} />
    <Art asset="game_mode_screen/Paper.png" x={304} y={302} w={48} />
    <Art asset="game_mode_screen/Scissors.png" x={63} y={412} w={48.5} />
    <FrontCloud x={-178} y={524} flip={false} />
    <ArtButton x={112.5} y={450} w={168.25} title="BEST OF 3" size={16} onPress={() => choose(3)} />
    <ArtButton x={112.5} y={542} w={168.25} title="BEST OF 5" size={16} onPress={() => choose(5)} />
  </GameCanvas>;
}

// Gender stars, measured per character from the design; they burst out from behind the character when picked.
const GENDER_STARS = {
  male: [{ asset: 'gender_screen/STAR BLOCKS.png', x: 3, y: 551, w: 39 }, { asset: 'gender_screen/STAR BLOCKS-1.png', x: 169, y: 609, w: 36 }, { asset: 'gender_screen/STAR BLOCKS-2.png', x: 160, y: 412, w: 35 }],
  female: [{ asset: 'gender_screen/STAR BLOCKS.png', x: 181, y: 522, w: 39 }, { asset: 'gender_screen/STAR BLOCKS-1.png', x: 355, y: 427, w: 36 }, { asset: 'gender_screen/STAR BLOCKS-2.png', x: 353, y: 607, w: 35, flip: true }],
} as const;

const STADIUM_H = 871 / 4;   // victor's_stadium.png at quarter scale

function GenderTower({ gender, x, selected }: { gender: 'male' | 'female'; x: number; selected: boolean }) {
  // 0 = resting, 1 = raised and crowned. Picking or unpicking springs between them instead of jumping.
  const [lift] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const spring = Animated.spring(lift, { toValue: selected ? 1 : 0, speed: 14, bounciness: 7, useNativeDriver: Platform.OS !== 'web' });
    spring.start();
    return () => spring.stop();
  }, [lift, selected]);
  const bursts = useBurst(3, { delay: 160, animate: selected });
  const tower = gender === 'male' ? 'gender_screen/guy_on_the_tower.png' : 'gender_screen/girl_on_the_tower.png';
  const from = { x: x + 88, y: 540 };
  const stars = (layer: 'back' | 'front') => selected && GENDER_STARS[gender].map((star, i) =>
    <BurstSprite key={star.asset} progress={bursts[i]} layer={layer} asset={star.asset} x={star.x} y={star.y} w={star.w} flip={'flip' in star && star.flip} from={from} spin={i === 1 ? 270 : -270} />);
  const rise = { transform: [{ translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }] };
  return <>
    {stars('back')}
    {/* Behind the tower, the stadium asset (the same gold tower) at its natural size, bottom-aligned just past the
        screen edge: as the tower rises its column continues below, and its top stays hidden behind the artwork. */}
    <Art asset="victory_defeat_draw_screen_online_duel_match/victor's_stadium.png" x={x} y={912 - STADIUM_H} w={170.25} />
    <Animated.View style={[box(0, 0, CANVAS.width, CANVAS.height), { pointerEvents: 'none' }, rise]}>
      <Art asset={tower} x={x} y={472} h={380} />
      {/* The crown drops onto the head and fades in as the tower rises. */}
      <Animated.View style={[box(0, 0, CANVAS.width, CANVAS.height), {
        opacity: lift.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
      }]}>
        <Art asset="gender_screen/CROWN_BLOCKS.png" x={x+51} y={442} w={72} />
      </Animated.View>
    </Animated.View>
    {stars('front')}
  </>;
}

export function GenderScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useGameStore();
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  return <GameCanvas background="gender_screen/Sky.png">
    <BackCloud y={330} />
    <HeaderDecor title="gender_screen/select_ur_gender.png" x={40} y={109} w={314} rockX={5} rockY={73} paperX={300} paperY={190} scissorsX={57} scissorsY={301} />
    <Label x={85} y={314} w={223} size={12} color="#ffda00">*Click on it</Label>
    <AnchorBottom>
    {(['male','female'] as const).map((g,i) => {
      const selected = gender === g;
      const x = i === 0 ? 16 : 207;
      return <View key={g}>
        <GenderTower gender={g} x={x} selected={selected} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Select ${g} avatar`} accessibilityState={{ selected }} onPress={() => setGender(g)} style={box(x,410,175,442)} />
      </View>;
    })}
    <FrontCloud asset="gender_screen/cloud_1.png" x={-198} y={654} flip={false} />
    </AnchorBottom>
    <ArtButton asset="gender_screen/next_button.png" x={320} y={26} w={46} accessibilityLabel="Confirm avatar" onPress={() => { setUserProfile({ ...userProfile, gender: gender ?? userProfile.gender ?? 'male' }); router.replace('/home'); }} />
  </GameCanvas>;
}

export function SettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile, setUserSession, resetStreak, resetScore } = useGameStore();
  const { soundVolume, musicVolume, setSoundVolume, setMusicVolume } = useMusic();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile.username);
  const [nameDialog, setNameDialog] = useState<null | 'taken' | 'invalid'>(null);
  const nameInput = useRef<TextInput>(null);
  const save = async () => {
    if (editing) {
      const username = name.trim() || userProfile.username;
      if (username !== userProfile.username) {
        if (!USERNAME_PATTERN.test(username)) { setNameDialog('invalid'); return; }
        try {
          // Reserve the new name (releasing the old one) before using it, so names stay unique.
          if (auth.currentUser) { await reserveUsername(username, auth.currentUser.uid, userProfile.username); await updateProfile(auth.currentUser, { displayName: username }); }
          setUserProfile({ ...userProfile, username });
        } catch (e) {
          if (e instanceof UsernameTakenError) { setNameDialog('taken'); return; }
          router.push({ pathname: '/oops', params: { returnTo: '/settings' } }); return;
        }
      }
    }
    setEditing(!editing);
  };
  const gender = () => setUserProfile({ ...userProfile, gender: userProfile.gender === 'female' ? 'male' : 'female' });
  // Matched to the approved layout (measured): 14px text with a slim 2.7px outline (1.7 + the global boost) and no
  // shadow; "USERNAME", its colon and the name are placed separately at their measured spots, and only the name
  // shrinks when it's long, so the label never moves.
  const ROW_SIZE = 14, ROW_OUTLINE = 1.7, NAME_X = 219.2, NAME_W = 117;
  const shownName = (editing ? name : userProfile.username).toUpperCase();
  const nameSize = Math.min(ROW_SIZE, NAME_W / Math.max(shownName.length + (editing ? 1 : 0), 1));
  const rowText = (text: string, x: number, y: number, size = ROW_SIZE) =>
    <Label x={x} y={y} w={190} h={24} size={size} align="left" outline={ROW_OUTLINE} shadow={false}>{text}</Label>;
  const profileRows = <>
    <Art asset="settings_screen/username_gender_box.png" x={43} y={222} w={306.25} />
    <Art asset="settings_screen/username_gender_box.png" x={43} y={314} w={306.25} />
    {editing && <Pressable accessible={false} onPress={() => focusAtEnd(nameInput.current, name.length)} style={box(43, 222, 306.25, 72.25)} />}
    {rowText('USERNAME', 74.6, 249.5)}
    {rowText(':', 198.4, 249.5)}
    {editing
      ? <PixelEditable focusRef={nameInput} label="Edit username" value={name} onChangeText={setName} upper autoFocus maxLength={12} onSubmitEditing={save}
          x={NAME_X} y={259 - nameSize * 0.7} width={NAME_W} size={nameSize} align="left" slide={false} color="#fff" outline={ROW_OUTLINE} />
      : rowText(shownName, NAME_X, 259 - nameSize * 0.675, nameSize)}
    {rowText('GENDER', 74.6, 340.5)}
    {rowText(':', 165, 340.5)}
    <Enter key={userProfile.gender ?? 'male'} from="fade" duration={200}><Label x={196.7} y={340.5} w={104} size={ROW_SIZE} outline={ROW_OUTLINE} shadow={false}>{(userProfile.gender ?? 'male').toUpperCase()}</Label></Enter>
    <ArtButton asset="settings_screen/LEFT ARROW.png" x={180.5} y={339} w={15.25} accessibilityLabel="Previous avatar" onPress={gender} />
    <ArtButton asset="settings_screen/RIGHT ARROW.png" x={304} y={339} w={15.25} accessibilityLabel="Next avatar" onPress={gender} />
  </>;
  return <GameCanvas background="settings_screen/Sky.png" keyboard>
    <BackCloud y={440} />
    <FrontCloud y={690} />
    <BackButton onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} />
    <HeaderDecor title="settings_screen/settings_vector.png" x={30} y={137} w={334} rockX={-3} rockY={89} paperX={337} paperY={177} scissorsX={95} scissorsY={168} />
    {!editing && profileRows}
    {([{title:'SOUND', value:soundVolume, setter:setSoundVolume, y:431}, {title:'MUSIC', value:musicVolume, setter:setMusicVolume, y:548}]).map(control => <View key={control.title}>
      <Label x={100} y={control.y-24} w={192} size={14} outline={2.5}>{control.title}</Label>
      <Art asset="settings_screen/sound_music_box.png" x={100} y={control.y} w={192.25} />
      {/* Five level slots: the empty frame always shows; each level that's on fades its yellow value in. */}
      {[0,1,2,3,4].map(i=><View key={i}>
        <Art asset="settings_screen/music_outter_box.png" x={124+i*30} y={control.y+24} w={24.25} />
        {i < control.value && <Enter from="fade" duration={160}><Art asset="settings_screen/volume_value.png" x={124+i*30+6} y={control.y+24+6} w={12.25} /></Enter>}
      </View>)}
      <ArtButton asset="settings_screen/minus_button.png" x={44} y={control.y+12} w={48} accessibilityLabel={`Decrease ${control.title.toLowerCase()}`} onPress={()=>control.setter(Math.max(0,control.value-1))} />
      <ArtButton asset="settings_screen/PLUS BUTTON.png" x={302} y={control.y+12} w={48} accessibilityLabel={`Increase ${control.title.toLowerCase()}`} onPress={()=>control.setter(Math.min(5,control.value+1))} />
    </View>)}
    <ArtButton asset="settings_screen/log_out_button.png" x={112.5} y={640} w={168.25} title="LOG OUT" onPress={async()=>{ try { await signOut(auth); setUserSession(null); resetScore(); resetStreak(); router.dismissAll(); router.replace('/login'); } catch { router.push('/oops'); } }} />
    {editing && <><Dimmer /><Enter from="scale">{profileRows}<Art asset="settings_screen/activr_state.png" x={293} y={0} w={100} /></Enter></>}
    <ArtButton asset="settings_screen/edit_button.png" x={320} y={26} w={46} accessibilityLabel={editing ? 'Save profile' : 'Edit profile'} onPress={save} />
    {nameDialog === 'taken' && <ArtworkDialog asset="authentiction_screen/username_taken.png" onClose={() => setNameDialog(null)} />}
    {nameDialog === 'invalid' && <ArtworkDialog asset="authentiction_screen/missing_info.png" title="USERNAME" body={'USE 3-12 LETTERS,\nNUMBERS OR _ ONLY.'} onClose={() => setNameDialog(null)} />}
  </GameCanvas>;
}
