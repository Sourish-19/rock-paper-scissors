import { useEffect, useRef, useState } from 'react';
import { Clipboard, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { deleteDoc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useGameStore } from '@/store/gameStore';
import { Art, ArtButton, BackButton, box, Dimmer, GameCanvas, HeaderDecor, Label, PixelEditable, focusAtEnd, Enter } from './primitives';
import { BackCloud, FrontCloud } from './motion';
import { ShareSheet } from './ShareSheet';
import { roomRef, type Player, type Room } from './online';

export default function OnlineLobbyScreen() {
  const router = useRouter();
  const { userProfile, winStreak } = useGameStore();
  // Rooms are protected by Firestore rules, so players act as their signed-in Firebase account.
  const [uid,setUid] = useState(()=>auth.currentUser?.uid ?? '');
  const [mode,setMode] = useState<'entry'|'create'|'join'>('entry');
  const [code,setCode] = useState('');
  const [input,setInput] = useState('');
  const [room,setRoom] = useState<Room|null>(null);
  const [busy,setBusy] = useState<'joining'|'creating'|'entering'|null>(null);
  const [message,setMessage] = useState('');
  const [copied,setCopied] = useState(false);
  const codeInput = useRef<TextInput>(null);
  const [sheet,setSheet] = useState(false);
  const isHost = room?.creator.uid === uid;
  // The crown number on player cards is the player's current win streak, as on Home.
  const player: Player = { ...userProfile, crowns: winStreak, username: auth.currentUser?.displayName || userProfile.username, uid, score:0 };
  useEffect(()=>onAuthStateChanged(auth,user=>{ if(user)setUid(user.uid); else router.replace('/login'); }),[router]);
  useEffect(()=>{
    if(!code)return;
    return onSnapshot(roomRef(code), snapshot=>{
      if(!snapshot.exists()){setRoom(null);setCode('');setMode('entry');setMessage('HOST CLOSED THE ROOM');return;}
      const data = snapshot.data() as Room;
      setRoom(data);
      if(data.status==='playing')setBusy('entering');
    },()=>{setMessage('ROOM CONNECTION FAILED. TRY AGAIN.');setBusy(null);});
  },[code]);
  useEffect(()=>{
    if(busy!=='entering'||!code)return;
    const timer=setTimeout(()=>router.replace({pathname:'/game/multiplayer',params:{roomId:code,myUid:uid}}),900);
    return()=>clearTimeout(timer);
  },[busy,code,uid,router]);
  const create = async(rounds:number)=>{
    setBusy('creating');setMessage('');
    try{
      let created='';
      for(let attempt=0;attempt<5&&!created;attempt++){
        const candidate=String(Math.floor(100000+Math.random()*900000));
        const success=await runTransaction(db,async t=>{
          const ref=roomRef(candidate);if((await t.get(ref)).exists())return false;
          const data:Room={roomId:candidate,status:'waiting',maxRounds:rounds,currentRound:1,creator:player,joiner:null,roundChoices:{},roundWinners:{},exits:{creatorExited:false,joinerExited:false},createdAt:Date.now(),matchId:0};
          t.set(ref,data);return true;
        });
        if(success)created=candidate;
      }
      if(!created)throw new Error('Room codes busy');
      setCode(created);setMode('create');
    }catch{router.push({pathname:'/oops',params:{returnTo:'/online-lobby'}});}finally{setBusy(null);}
  };
  // The host picks the room length on the mode screen, which hands it back here; joiners never see that screen.
  const createRef=useRef(create);
  useEffect(()=>{createRef.current=create;});
  useEffect(()=>{
    if(!uid)return;
    const take=()=>{
      const rounds=useGameStore.getState().pendingRoomRounds;
      if(rounds===null)return;
      useGameStore.getState().setPendingRoomRounds(null);
      void createRef.current(rounds);
    };
    const pending=setTimeout(take,0);   // a choice made before this screen subscribed
    const unsubscribe=useGameStore.subscribe(take);
    return()=>{clearTimeout(pending);unsubscribe();};
  },[uid]);
  const join = async()=>{
    const entered=input.trim().toUpperCase();
    if(!/^\d{6}$/.test(entered)){setMessage('ENTER THE SIX-DIGIT ROOM CODE');return;}
    setBusy('joining');setMessage('');
    try{
      await runTransaction(db,async t=>{
        const ref=roomRef(entered);const snap=await t.get(ref);
        if(!snap.exists())throw new Error('ROOM NOT FOUND');
        const data=snap.data() as Room;
        if(data.creator.uid===uid)throw new Error('YOU ALREADY HOST THIS ROOM');
        if(data.status!=='waiting'||data.joiner)throw new Error('ROOM IS FULL OR PLAYING');
        t.update(ref,{joiner:player,status:'ready'});
      });
      setCode(entered);
    }catch(e){setMessage(e instanceof Error?e.message:'COULD NOT JOIN ROOM');}finally{setBusy(null);}
  };
  const leave = async()=>{
    try{if(code){if(isHost)await deleteDoc(roomRef(code));else await updateDoc(roomRef(code),{joiner:null,status:'waiting'});}}
    catch{setMessage('COULD NOT LEAVE ROOM. TRY AGAIN.');return;}
    setCode('');setRoom(null);setMode('entry');
  };
  const ready = !!room?.joiner;
  const roomCodeX = 196.5 - (12 + code.length) * 11.5 / 2;
  const titleY = mode==='entry' ? 242 : mode==='create' ? 239 : 238;
  const cards = (p:Player,x:number,label:string)=><View key={label}>
    <Label x={x} y={348} w={132} color="#ffda00" size={15.5}>{label}</Label>
    <Art asset={p.gender==='female'?'online_duel_screen/female_player.png':'online_duel_screen/male_player.png'} x={x} y={375} w={132.25} />
    <Label x={x+6} y={493} w={120} size={Math.min(14.5, 112 / Math.max(p.username.length, 1))}>{p.username.toUpperCase()}</Label>
    <Art asset="online_duel_screen/CROWN_BLOCKS.png" x={x+38} y={520} w={17} />
    <Label x={x+60} y={518} w={50} size={14} align="left">{p.crowns}</Label>
  </View>;
  return <GameCanvas background="online_duel_screen/Sky.png" keyboard>
    <BackCloud y={150} />
    <FrontCloud y={690} />
    {!ready&&<BackButton onPress={()=>code?leave():mode!=='entry'?setMode('entry'):router.canGoBack()?router.back():router.replace('/home')} />}
    {ready&&room?.joiner?<Enter key="ready" from="scale">
      <Art asset="online_duel_screen/all_the_stars.png" x={102} y={118} w={188.25} />
      <Art asset="online_duel_screen/room_ready.png" x={2} y={169} w={388.75} />
      <Label x={roomCodeX} y={304} w={140} size={11.5} align="left">ROOM CODE :</Label>
      <Label x={roomCodeX+12*11.5} y={304} w={200} size={11.5} align="left" color="#ffda00">{code}</Label>
      {cards(isHost?room.creator:room.joiner,16,'YOU')}{cards(isHost?room.joiner:room.creator,245,'FRIEND')}
      <Label x={163} y={447} w={67} size={28} color="#ffda00" outline={2}>VS</Label>
      <Label x={17} y={605} w={359} size={12}>{isHost?'You are the host':'Waiting for host to start...'}</Label>
      <ArtButton asset={isHost?'online_duel_screen/start_match_button.png':'online_duel_screen/leave_room_button.png'} x={44} y={661} w={300.25} title={isHost?'START MATCH':'LEAVE ROOM'} onPress={async()=>{if(!isHost){await leave();return;}try{await updateDoc(roomRef(code),{status:'playing'});}catch{setMessage('COULD NOT START MATCH');}}} />
    </Enter>:<Enter key={mode}>
      <HeaderDecor title="online_duel_screen/online_duel_vector.png" x={44} y={titleY} w={312} rockX={9} rockY={titleY-46} paperX={335} paperY={titleY+50} scissorsX={54} scissorsY={titleY+90} />
      {mode==='entry'?<>
        <Label x={60} y={387.5} w={273} size={12} color="#ffda00">1v1 FRIEND MATCH</Label>
        <ArtButton asset="online_duel_screen/create_room_button.png" x={49} y={449} w={300.25} title={busy==='creating'?'CREATING...':'CREATE ROOM'} disabled={!!busy||!uid} onPress={()=>router.push({pathname:'/game-mode',params:{mode:'multi'}})} />
        <Label x={160} y={539} w={73} size={14}>OR</Label>
        <Label x={55} y={537} w={114} size={16}>-------</Label><Label x={230} y={537} w={114} size={16}>-------</Label>
        <ArtButton asset="online_duel_screen/roin_room_button.png" x={49} y={581} w={300.25} title="JOIN ROOM" onPress={()=>{setMode('join');setMessage('');}} />
      </>:mode==='create'?<>
        <Label x={60} y={384.5} w={273} size={12} color="#ffda00">ROOM CODE</Label>
        <Art asset="online_duel_screen/room_input_box.png" x={46} y={446} w={306.25} />
        <Label x={65} y={471} w={269} size={20} color="#ffda00" outline={2}>{code}</Label>
        <ArtButton asset="online_duel_screen/copy_button.png" x={46} y={538} w={144.25} accessibilityLabel={copied?'COPIED':'COPY'} onPress={()=>{Clipboard.setString(code);setCopied(true);}}><Art asset="online_duel_screen/copy_icon.png" x={17} y={16} w={33} /><Enter key={String(copied)} from="fade" duration={180}><Label x={40} y={27} w={104} size={copied?13:15}>{copied?'COPIED':'COPY'}</Label></Enter></ArtButton>
        <ArtButton asset="online_duel_screen/share_button.png" x={208} y={538} w={144.25} accessibilityLabel="SHARE" onPress={()=>setSheet(true)}><Art asset="online_duel_screen/share_icon.png" x={8} y={22} w={38} /><Label x={40} y={27} w={104} size={15}>SHARE</Label></ArtButton>
        <Label x={27} y={634} w={339} size={12}>Waiting for player...</Label>
      </>:<>
        <Label x={60} y={384} w={273} size={12} color="#34a5fb">JOIN ROOM</Label>
        <Label x={60} y={417} w={273} size={12}>Enter Room Code</Label>
        <Art asset="online_duel_screen/room_input_box.png" x={43} y={446} w={306.25} />
        <Pressable accessible={false} onPress={()=>focusAtEnd(codeInput.current,input.length)} style={box(43,446,306.25,72.25)} />
        <PixelEditable focusRef={codeInput} label="Room code" value={input} onChangeText={setInput} numeric maxLength={6} upper
          x={62} y={471} width={269} size={20} align="center" fit={false} color="#ffda00" outline={2} shadow />
        <ArtButton asset="online_duel_screen/join_button.png" x={124} y={538} w={144.25} title="JOIN" disabled={!!busy||!uid} onPress={join} />
      </>}
    </Enter>}
    {!!message&&<Label x={18} y={747} w={357} h={70} size={10} color="#ffda00">{message}</Label>}
    {(busy==='joining'||busy==='entering')&&<><Dimmer/><Enter key={busy} from="scale"><Art asset={busy==='joining'?'online_duel_screen/1v1_box.png':'online_duel_screen/entering_match_box.png'} x={15.5} y={349} w={362}/></Enter></>}
    {sheet && <ShareSheet title="INVITE A FRIEND" message={`Join my Rock Paper Scissors duel! Room code: ${code}`} onClose={()=>setSheet(false)} />}
  </GameCanvas>;
}
