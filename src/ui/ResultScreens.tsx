import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useGameStore } from '@/store/gameStore';
import { AnchorBottom, Art, ArtButton, BackButton, Dimmer, GameCanvas, HeaderDecor, Label, box, Enter } from './primitives';
import { BackCloud, BurstSprite, FrontCloud, useBurst } from './motion';
import { ShareSheet } from './ShareSheet';
import type { Artwork } from './artwork';
import { acceptRematch, roomRef, type Room } from './online';

type Outcome = 'win' | 'lose' | 'draw';
const folders = { win: 'victory_screen_solo_match', lose: 'defeat_screen_solo_match', draw: 'draw_screen_solo_match' } as const;
const onlineFolder = 'victory_defeat_draw_screen_online_duel_match';
const names = { win: 'victory', lose: 'defeat', draw: 'draw' } as const;
const asset = (folder: string, name: string) => `${folder}/${name}.png` as Artwork;

// Canvas point at the centre of the solo victory character, where the stars start.
const SOLO_STAR_ORIGIN = { x: 200, y: 570 };

function SoloArtwork({ outcome, sharing = false }: { outcome: Outcome; sharing?: boolean }) {
  const female = useGameStore(s => s.userProfile.gender === 'female');
  const folder = folders[outcome];
  const character = outcome === 'win' ? `SMILE ${female ? 'GIRL' : 'GUY'}` : outcome === 'lose' ? `cry_${female ? 'girl' : 'guy'}` : `SAD ${female ? 'GIRL' : 'GUY'}`;
  // Victory stars burst out from behind the character to their places (static in the share preview).
  const bursts = useBurst(3, { animate: !sharing });
  const stars = (layer: 'back' | 'front') => outcome === 'win' && <>
    <BurstSprite progress={bursts[0]} layer={layer} asset={asset(folder,'STAR BLOCKS')} x={292} y={368} w={100.5} from={SOLO_STAR_ORIGIN} />
    <BurstSprite progress={bursts[1]} layer={layer} asset={asset(folder,'STAR BLOCKS-1')} x={28} y={555} w={107.75} from={SOLO_STAR_ORIGIN} spin={270} />
    <BurstSprite progress={bursts[2]} layer={layer} asset={asset(folder,'STAR BLOCKS-2')} x={285} y={654} w={107.75} from={SOLO_STAR_ORIGIN} />
  </>;
  return <>
    {!sharing && <BackCloud y={380} />}
    <Art asset={asset(folder,outcome === 'win' ? 'Victory Stadium' : 'Defeated Stadium')} x={71} y={699} w={243} />
    {stars('back')}
    <Art asset={asset(folder,character)} x={female || outcome !== 'win' ? 86 : 81} y={427} h={315} />
    {outcome === 'win' && <>
      <Art asset={asset(folder,'CROWN_BLOCKS')} x={150} y={389} w={83} />
      {stars('front')}
    </>}
    {outcome === 'lose' && <>
      <Art asset={asset(folder,'Group 33')} x={116} y={388} w={161.75} />
      <Art asset={asset(folder,'Green Balloon')} x={52} y={336} w={108.25} />
      <Art asset={asset(folder,'Blue Balloon')} x={264} y={542} w={108.25} />
      <Art asset={asset(folder,'Red Balloon')} x={22} y={558} w={108.25} />
    </>}
    {!sharing && <FrontCloud x={-198} y={654} flip={false} />}
  </>;
}

function OnlineArtwork() {
  const result = useGameStore(s => s.onlineResult);
  const bursts = useBurst(3);
  if (!result) return null;
  return <AnchorBottom><BackCloud y={380} />{[result.me,result.opponent].map((player,i) => {
    const other = i === 0 ? result.opponent : result.me;
    const won = player.score > other.score;
    const draw = player.score === other.score;
    // Me on the left, opponent on the right; offsets measured from "Online Duel - Victory Page.png".
    const x = i === 0 ? 16 : 208;
    const y = won ? 443 : 474;
    const character = draw ? `draw_screen_solo_match/SAD ${player.gender === 'female' ? 'GIRL' : 'GUY'}.png` as Artwork : asset(onlineFolder,won ? `SMILE ${player.gender === 'female' ? 'GIRL' : 'GUY'}` : `cry_${player.gender === 'female' ? 'girl' : 'guy'}`);
    // The winner's stars burst out from behind the character's centre.
    const from = { x: x + 95, y: y + 110 };
    const stars = (layer: 'back' | 'front') => won && <>
      <BurstSprite progress={bursts[0]} layer={layer} asset={asset(onlineFolder,'STAR BLOCKS')} x={x+145} y={416} w={30} from={from} />
      <BurstSprite progress={bursts[1]} layer={layer} asset={asset(onlineFolder,'STAR BLOCKS-1')} x={x-10} y={560} w={32} from={from} spin={270} />
      <BurstSprite progress={bursts[2]} layer={layer} asset={asset(onlineFolder,'STAR BLOCKS-2')} x={x+154} y={610} w={30} from={from} />
    </>;
    return <React.Fragment key={player.uid}>
      <Art asset={asset(onlineFolder,won ? "victor's_stadium" : "defeated's_stadium")} x={x} y={won ? 635 : 666} w={170.25} />
      {stars('back')}
      <Art asset={character} x={x+(won?11:12)} y={y} h={220} />
      {won && <><Art asset={asset(onlineFolder,'CROWN_BLOCKS')} x={x+51} y={411} w={74} />{stars('front')}</>}
      {!won && !draw && <><Art asset={asset(onlineFolder,'clown')} x={x+39} y={453} w={100} /><Art asset={asset(onlineFolder,'Green Balloon')} x={x+1} y={420} w={65} /><Art asset={asset(onlineFolder,'Red Balloon')} x={x-18} y={577} w={65} /><Art asset={asset(onlineFolder,'Blue Balloon')} x={x+142} y={573} w={65} /></>}
      <Label x={x-5} y={803} w={180} size={15} color={won?'#ffdf00':'#b69c8d'} outline={2}>{player.username.toUpperCase()}</Label>
    </React.Fragment>;
  })}<FrontCloud x={-198} y={654} flip={false} /></AnchorBottom>;
}

// The leading (or tied) score is yellow and the trailing score red, as in the references.
const scoreColor = (score: number, other: number) => score < other ? '#d44d4e' : '#ffd600';

// Decoration positions measured per outcome from the result references (online victory matches solo victory).
const soloDecor = {
  win: { rockX: 2, rockY: -1, paperX: 338, paperY: 44, scissorsX: 77, scissorsY: 94 },
  lose: { rockX: 15, rockY: 10, paperX: 318, paperY: 38, scissorsX: 77, scissorsY: 94 },
  draw: { rockX: 45, rockY: 10, paperX: 268, paperY: 48, scissorsX: 139, scissorsY: 87 },
} as const;

export function ResultComposition({ outcome, online = false, post = false, sharing = false, onNext, onRematch, onHome, onShare }: { outcome: Outcome; online?: boolean; post?: boolean; sharing?: boolean; onNext?: () => void; onRematch?: () => void; onHome?: () => void; onShare?: () => void }) {
  const { matchState,winStreak } = useGameStore();
  const folder = online ? onlineFolder : folders[outcome];
  const width = outcome === 'win' ? 288 : outcome === 'lose' ? 248 : 168;
  return <>
    <HeaderDecor title={asset(folder,names[outcome])} x={(393-width)/2-2.5} y={46} w={width} {...soloDecor[outcome]} />
    {post ? <Enter key="post" from="scale"><ArtButton asset={asset(folder,'rematch_home_button')} x={126} y={174} w={168.25} title="REMATCH" onPress={onRematch!} /><ArtButton asset={asset(folder,'rematch_home_button')} x={126} y={266} w={168.25} title="HOME" onPress={onHome!} /></Enter> : <Enter key="score" from="fade">
      {[162,242].map(y => <Art key={y} asset={asset(folder,'score_streak_box')} x={45} y={y} w={306.25} />)}
      {/* Words left, colon in a fixed column, values right-aligned to x=318 — as in the references. */}
      <Label x={79} y={186} w={140} size={20} align="left" outline={2.5}>SCORE</Label>
      <Label x={218.5} y={186} w={20} size={20} outline={2.5}>:</Label>
      <Label x={159} y={186} w={120} size={20} align="right" color={scoreColor(matchState.userScore,matchState.computerScore)} outline={2.5}>{matchState.userScore}</Label>
      <Label x={279} y={186} w={20} size={20} outline={2.5}>:</Label>
      <Label x={299} y={186} w={80} size={20} align="left" color={scoreColor(matchState.computerScore,matchState.userScore)} outline={2.5}>{matchState.computerScore}</Label>
      <Label x={79} y={265} w={140} size={20} align="left" outline={2.5}>STREAK</Label>
      <Label x={218.5} y={265} w={20} size={20} outline={2.5}>:</Label>
      <Label x={199} y={266} w={120} size={20} align="right" color="#ffd600" outline={2.5}>{winStreak}</Label>
      {onShare && <ArtButton asset={asset(folder,'share_button')} x={148} y={322} w={100} accessibilityLabel="Share result" onPress={onShare!}>
        <Label x={0} y={11.5} w={100} size={13} outline={2}>SHARE</Label>
      </ArtButton>}
    </Enter>}
    {online ? <OnlineArtwork /> : <SoloArtwork outcome={outcome} sharing={sharing} />}
    {!post && !sharing && !online && <ArtButton asset={asset(folder,'next_button')} x={320} y={779} w={46} accessibilityLabel="Next" onPress={onNext!} />}
  </>;
}

export function SoloResultScreen({ outcome }: { outcome: Outcome }) {
  const router = useRouter();
  const [post,setPost] = useState(false);
  const resetScore = useGameStore(s => s.resetScore);
  return <GameCanvas><ResultComposition outcome={outcome} post={post} onNext={() => setPost(true)} onRematch={() => { resetScore(); router.replace('/game'); }} onHome={() => router.dismissTo('/home')} onShare={() => router.push({ pathname:'/share',params:{outcome} })} /></GameCanvas>;
}

export function OnlineResultScreen() {
  const router = useRouter();
  const result = useGameStore(s => s.onlineResult);
  const [post,setPost] = useState(false);
  const [room,setRoom] = useState<Room | null>(null);
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  // The online result design has no Next control, so the rematch/home choices follow automatically.
  useEffect(() => {
    if (post) return;
    const timer = setTimeout(() => setPost(true), 4000);
    return () => clearTimeout(timer);
  }, [post]);
  useEffect(() => {
    if (!result) return;
    return onSnapshot(roomRef(result.roomId),snapshot => {
      if (!snapshot.exists()) { setRoom(null); setMessage('ROOM CLOSED'); return; }
      const next = snapshot.data() as Room;
      setRoom(next);
      if (next.status === 'playing' && (next.matchId ?? 0) > result.matchId) router.replace({pathname:'/game/multiplayer',params:{roomId:result.roomId,myUid:result.myUid}});
    },() => setMessage('CONNECTION LOST. TRY AGAIN.'));
  },[result,router]);
  if (!result) return <GameCanvas><Label x={20} y={330} w={353} h={70}>PLAY AN ONLINE DUEL FIRST</Label><ArtButton x={112.5} y={450} title="HOME" onPress={() => router.dismissTo('/home')} /></GameCanvas>;
  const action = async (fn: () => Promise<unknown>) => { setBusy(true); try { await fn(); } catch { setMessage('COULD NOT CONNECT. TRY AGAIN.'); } finally { setBusy(false); } };
  const request = () => action(() => runTransaction(db,async transaction => {
    const ref = roomRef(result.roomId); const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Room closed');
    const data = snapshot.data() as Room;
    if (data.exits.creatorExited || data.exits.joinerExited) { setMessage('YOUR FRIEND HAS LEFT'); return; }
    if (data.rematch && !data.rematch.deniedBy) return;
    transaction.update(ref,{rematch:{requestedBy:result.myUid}});
  }));
  const incoming = room?.rematch && !room.rematch.deniedBy && room.rematch.requestedBy !== result.myUid;
  return <GameCanvas>
    <ResultComposition outcome={result.outcome} online post={post} onNext={() => setPost(true)} onRematch={request} onHome={() => { void action(async () => { await updateDoc(roomRef(result.roomId),{[`exits.${room?.creator.uid===result.myUid?'creatorExited':'joinerExited'}`]:true}); router.dismissTo('/home'); }); }} onShare={() => router.push({pathname:'/share',params:{outcome:result.outcome,online:'1'}})} />
    {room?.rematch?.requestedBy===result.myUid && !room.rematch.deniedBy && <Label x={20} y={350} w={353} size={10}>WAITING FOR YOUR FRIEND...</Label>}
    {(message || room?.rematch?.deniedBy) && <Label x={15} y={370} w={363} size={10}>{message || 'REMATCH DECLINED'}</Label>}
    {incoming && <><Dimmer /><Enter from="scale"><Art asset={asset(onlineFolder,'rematch_request')} x={15.5} y={257} w={362} />
      <View style={[box(36,318,321,64),{backgroundColor:'#ffd600'}]} />
      <Label x={26} y={325.5} w={341} h={52} size={Math.min(15.5, 330 / (result.opponent.username.length + 14))} outline={2} style={{lineHeight:24}}>{`${result.opponent.username.toUpperCase()} HAS REQUESTED\nFOR A REMATCH!`}</Label>
      <ArtButton asset={asset(onlineFolder,'accept_button')} x={112.5} y={431} w={168.25} title="ACCEPT" size={13.5} accessibilityLabel="Accept rematch" disabled={busy} onPress={() => { void action(() => acceptRematch(result.roomId,result.myUid)); }} />
      <ArtButton asset={asset(onlineFolder,'deny_button')} x={112.5} y={523} w={168.25} title="DENY" size={13.5} accessibilityLabel="Deny rematch" disabled={busy} onPress={() => { void action(() => updateDoc(roomRef(result.roomId),{'rematch.deniedBy':result.myUid})); }} /></Enter></>}
  </GameCanvas>;
}

export function ShareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{outcome?: string; online?: string}>();
  const outcome: Outcome = params.outcome==='lose' || params.outcome==='draw' ? params.outcome : 'win';
  const { matchState,userProfile } = useGameStore();
  const online = params.online === '1';
  const [sheet,setSheet] = useState(false);
  const shareText = `${userProfile.username}: ${names[outcome].toUpperCase()}! ${matchState.userScore}:${matchState.computerScore} in Rock Paper Scissors.`;
  const share = () => setSheet(true);
  return <GameCanvas>
    {/* The live result page shown inside the phone, at the scale and origin measured from the share references. */}
    <View style={[box(28,60,343,754),{overflow:'hidden'}]}><View style={{position:'absolute',left:online?-5:-3.5,top:online?0.5:3,width:393,height:852,transform:[{scale:0.882}],transformOrigin:'top left'}}><Art asset="general/Sky.png" x={0} y={0} w={393} h={852} /><ResultComposition outcome={outcome} online={online} sharing onShare={() => { void share(); }} /></View></View>
    <Art asset="share_screen/mobile_hand.png" x={-1} y={14} w={395} />
    <BackButton onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} />
    {/* Tap target for the SHARE pill drawn inside the scaled preview: the preview's origin plus the pill at 0.882 scale. */}
    <Pressable accessibilityRole="button" accessibilityLabel="Share match result" onPress={share} style={box(28 + (online ? -5 : -3.5) + 148 * 0.882, 60 + (online ? 0.5 : 3) + 322 * 0.882, 100 * 0.882, 43 * 0.882)} />
    {sheet && <ShareSheet title="SHARE RESULT" message={shareText} onClose={() => setSheet(false)} />}
  </GameCanvas>;
}
