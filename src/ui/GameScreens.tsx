import { useCallback, useContext, useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onSnapshot, updateDoc } from 'firebase/firestore';
import { useGameStore, type Choice } from '@/store/gameStore';
import { useMusic } from '@/components/MusicProvider';
import { Art, Backdrop, ArtButton, box, CanvasEdges, Dimmer, GameCanvas, HeaderDecor, Label, Enter } from './primitives';
import { type Artwork } from './artwork';
import { roomRef, settleOnlineRound, type Move, type Room, winner } from './online';

type Phase = 'selecting'|'waiting'|'counting'|'reveal'|'feedback';
type Overlay = null|'pause'|'quit'|'restart';
type RoundMark = 'win'|'lose'|'draw';
const hand = (move:Choice,opponent:boolean):Artwork => {
  const color=opponent?'RED':'BLUE';
  if(move==='rock')return `game_screen/ROCK ${color} HAND BLOCKS.png`;
  if(move==='paper')return `game_screen/PAPER ${color} HAND BLOCKS.png`;
  if(move==='scissors')return `game_screen/SCISSOR ${color} HAND BLOCKS.png`;
  return opponent?'game_screen/HOLD STATE REDHANDS BLOCK.png':'game_screen/HOLD STATE BLUE HANDS BLOCK.png';
};

export function Arena({ mine, opponent, phase, countdown, history, maxRounds, name, opponentName, onMove, onPause, result, waitingText = 'WAITING FOR FRIEND...' }: {
  mine:Choice;opponent:Choice;phase:Phase;countdown:number;history:RoundMark[];maxRounds:number;name:string;opponentName:string;
  onMove:(move:Move)=>void;onPause:()=>void;result?:RoundMark;waitingText?:string;
}) {
  const reveal=phase==='reveal'||phase==='feedback';
  const mineMove=reveal?mine:null,opponentMove=reveal?opponent:null;
  const size=(move:Choice)=>move==='paper'?{w:177,h:385}:move==='scissors'?{w:187,h:385}:{w:188,h:319};
  const top=size(opponentMove),bottom=size(mineMove);
  // Measured from the references: paper sits 8px left of centre and every shadow is a pure horizontal offset.
  const topX=(393-top.w)/2-(opponentMove==='paper'?8:0),bottomX=(393-bottom.w)/2;
  const shadowDx=(move:Choice)=>move==='paper'?30:22;
  // On phones the opponent's sleeve starts at the physical top edge (under the status bar), and the countdown
  // stays centred in the gap between the two hands, which grows by that amount.
  const { top: screenTop } = useContext(CanvasEdges);
  const topY=-screenTop, countY=396-screenTop/2;
  // The player's pips stack upwards from the first round, mirroring the opponent's column.
  const bottomPipY=(i:number)=>663-i*36;
  // Classic rock-paper-scissors pump: on every count both fists dip toward each other and spring back, and on the
  // reveal they thrust in once more and settle, so the round reads as one continuous motion.
  const [pump]=useState(()=>new Animated.Value(0));
  useEffect(()=>{
    if(phase!=='counting'&&phase!=='reveal')return;
    const nativeDriver=Platform.OS!=='web';
    const beat=Animated.sequence([
      Animated.timing(pump,{toValue:1,duration:phase==='reveal'?110:150,easing:Easing.out(Easing.quad),useNativeDriver:nativeDriver}),
      Animated.spring(pump,{toValue:0,speed:18,bounciness:phase==='reveal'?12:6,useNativeDriver:nativeDriver}),
    ]);
    beat.start();
    return()=>beat.stop();
  },[pump,phase,countdown]);
  const towards=(sign:number)=>({transform:[{translateY:pump.interpolate({inputRange:[0,1],outputRange:[0,sign*18]})}]});
  const layer=box(0,0,393,852);
  return <>
    <View style={{position:'absolute',opacity:0,width:1,height:1,overflow:'hidden',pointerEvents:'none'}}>
      {(['rock','paper','scissors'] as const).flatMap(m=>[hand(m,true),hand(m,false)]).map(a=><Art key={a} asset={a} x={0} y={0} w={1} h={1}/>)}
    </View>
    <Animated.View style={[layer,{pointerEvents:'none'},towards(1)]}>
      <Art asset={hand(opponentMove,true)} x={topX+shadowDx(opponentMove)} y={topY} w={top.w} h={top.h} rotate={180} tint="#000" opacity={0.65}/>
      <Art asset={hand(opponentMove,true)} x={topX} y={topY} w={top.w} h={top.h} rotate={180}/>
    </Animated.View>
    <Animated.View style={[layer,{pointerEvents:'none'},towards(-1)]}>
      <Art asset={hand(mineMove,false)} x={bottomX+shadowDx(mineMove)} y={852-bottom.h} w={bottom.w} h={bottom.h} tint="#000" opacity={0.65}/>
      <Art asset={hand(mineMove,false)} x={bottomX} y={852-bottom.h} w={bottom.w} h={bottom.h}/>
    </Animated.View>
    {/* Names up to the 12-character signup limit stay on one line: wide boxes, shrinking only when needed. */}
    <Label x={27} y={27} w={280} h={26} size={Math.min(16, 280 / Math.max(opponentName.length, 1))} align="left">{opponentName.toUpperCase()}</Label>
    <Label x={186} y={718} w={180} h={26} size={Math.min(15, 180 / Math.max(name.length, 1))} align="right">{name.toUpperCase()}</Label>
    {Array.from({length:maxRounds},(_,i)=><View key={i}>
      <Art asset="game_screen/empty_score.png" x={27} y={75+i*36} w={36}/>
      {history[i]&&history[i]!=='draw'&&<Enter from="fade"><Art asset={history[i]==='win'?'game_screen/lost_point.png':'game_screen/won_point.png'} x={27} y={75+i*36} w={36}/></Enter>}
      <Art asset="game_screen/empty_score.png" x={330} y={bottomPipY(i)} w={36}/>
      {history[i]&&history[i]!=='draw'&&<Enter from="fade"><Art asset={history[i]==='win'?'game_screen/won_point.png':'game_screen/lost_point.png'} x={330} y={bottomPipY(i)} w={36}/></Enter>}
    </View>)}
    <ArtButton asset="game_screen/Settings Button.png" x={320} y={26} w={46} accessibilityLabel="Pause game" onPress={onPause}/>
    {(['rock','paper','scissors'] as const).map((move,i)=><ArtButton key={move} asset="game_screen/control_buttons.png" x={39+i*121.5} y={754} w={72} accessibilityLabel={`Choose ${move}`} disabled={phase!=='selecting'} dimDisabled={false} onPress={()=>onMove(move)}>
      {move==='rock'?<Art asset="game_screen/Stone.png" x={15} y={19} w={42}/>:move==='paper'?<Art asset="game_screen/Paper.png" x={20.5} y={21} w={33}/>:<Art asset="game_screen/Scissors.png" x={16} y={14} w={43}/>}
    </ArtButton>)}
    {phase==='selecting'&&<Enter from="fade" duration={200}><Label x={29.5} y={countY} w={353} h={60} size={40} outline={3}>SHOOT</Label></Enter>}
    {/* The designs place the countdown digits 12px left of where SHOOT sits. */}
    {phase==='counting'&&<Enter key={countdown} from="scale"><Label x={countdown<4?17.5:29.5} y={countY} w={353} h={60} size={40} color="#ffda00" outline={3}>{countdown<4?String(countdown):'SHOOT'}</Label></Enter>}
    {phase==='waiting'&&<Enter from="fade"><Label x={25} y={414} w={343} size={12} color="#ffda00">{waitingText}</Label></Enter>}
    {phase==='feedback'&&<>
      <Dimmer/>
      <Enter from="scale">
        <Art asset={result==='draw'?'game_screen/draw_state.png':'game_screen/round_result.png'} x={15.5} y={349} w={362}/>
        {result==='lose'&&<View style={[box(36,422,321,43),{backgroundColor:'#ffda00'}]}><Label x={0} y={4} w={321} h={40} size={15}>ONE POINT TO {opponentName==='BOT'?'BOT':'FRIEND'}</Label></View>}
      </Enter>
    </>}
  </>;
}

// The supplied exit box only has a red title tab; the restart design recolours that same tab yellow.
// Rebuilt on the artwork's 4.75px pixel grid, measured from "Restart Screen.png".
function RestartTab() {
  const P=4.75,L=70.75,R=323.25,T=257,B=316.25;
  const rect=(x:number,y:number,w:number,h:number,color:string)=><View key={`${x}:${y}:${color}`} style={[box(x,y,w,h),{backgroundColor:color}]}/>;
  return <View style={[box(0,0,393,852),{pointerEvents:'none'}]}>
    {rect(L+P,T+P,R-L-2*P,B-T-2*P,'#efa900')}
    {rect(L+2*P,T+P,R-L-4*P,301.75-T-P,'#ffd600')}
    {rect(L+2*P,T+2*P,P,P,'#ffe5aa')}
    {rect(L+2*P,T,R-L-4*P,P,'#000')}{rect(L+2*P,B-P,R-L-4*P,P,'#000')}
    {rect(L,T+2*P,P,B-T-4*P,'#000')}{rect(R-P,T+2*P,P,B-T-4*P,'#000')}
    {rect(L+P,T+P,P,P,'#000')}{rect(R-2*P,T+P,P,P,'#000')}{rect(L+P,B-2*P,P,P,'#000')}{rect(R-2*P,B-2*P,P,P,'#000')}
  </View>;
}

function PauseOverlay({ state,setState,onResume,onRestart,onQuit,online=false }: {state:Overlay;setState:(state:Overlay)=>void;onResume:()=>void;onRestart:()=>void;onQuit:()=>void;online?:boolean}) {
  const { soundVolume,setSoundVolume }=useMusic();
  if(!state)return null;
  return <View accessibilityViewIsModal style={box(0,0,393,852)}>
    <Backdrop asset="general/Sky.png"/>
    {/* Pause menu rises in; the quit/restart confirmations pop in. */}
    <Enter key={state} from={state==='pause'?'up':'scale'}>
    {state==='pause'?<>
      <HeaderDecor title="game_screen/Group 83.png" x={70} y={46} w={248} paperX={318} paperY={38}/>
      <ArtButton asset="game_screen/button.png" x={100.5} y={222} w={192.25} title="RESUME" onPress={onResume}/>
      <ArtButton asset="game_screen/button.png" x={100.5} y={335} w={192.25} title={online?'REMATCH':'RESTART'} onPress={()=>setState('restart')}/>
      <ArtButton asset="game_screen/button.png" x={100.5} y={448} w={192.25} accessibilityLabel={soundVolume>0?'Turn sound off':'Turn sound on'} onPress={()=>setSoundVolume(soundVolume>0?0:4)}>
        <Label x={8} y={23} w={122} size={15}>SOUND :</Label><Label x={133} y={23} w={48} size={15} color={soundVolume>0?'#7bcc00':'#d74747'}>{soundVolume>0?'ON':'OFF'}</Label>
      </ArtButton>
      <ArtButton asset="game_screen/quit_button.png" x={100.5} y={561} w={192.25} title="QUIT MATCH" size={15} onPress={()=>setState('quit')}/>
    </>:<>
      <Art asset="game_screen/exit_game_box.png" x={15.5} y={257} w={362}/>
      {state==='restart'&&<>
        <RestartTab/>
        <Label x={70} y={275} w={253} h={24} size={15.5}>RESTART GAME ?</Label>
        <View style={[box(39,327,315,60),{backgroundColor:'#ffd600'}]}/>
        <Label x={39} y={326} w={315} h={50} size={12} style={{lineHeight:24}}>{online?'START A NEW DUEL\nWITH YOUR FRIEND?':'ARE YOU SURE YOU\nWANT TO RESTART ?'}</Label>
      </>}
      <Art asset="general/Stone.png" x={7} y={196} w={84.75}/><Art asset="general/Paper.png" x={336} y={319} w={48}/><Art asset="general/Scissors.png" x={51} y={409} w={48.5}/>
      <ArtButton asset={state==='quit'?'game_screen/yes_exit_button.png':'game_mode_screen/button.png'} x={112.5} y={431} w={168.25} title={state==='quit'?'YES,EXIT':'YES'} onPress={state==='quit'?onQuit:onRestart}/>
      <ArtButton asset="game_mode_screen/button.png" x={112.5} y={523} w={168.25} title="CANCEL" onPress={()=>setState('pause')}/>
    </>}
    </Enter>
  </View>;
}

export function SoloGameScreen() {
  const router=useRouter();
  const {matchState,userProfile,makeChoice,resetScore,resetMatch,incrementStreak,resetStreak}=useGameStore();
  const [phase,setPhase]=useState<Phase>('selecting');
  const [countdown,setCountdown]=useState(1);
  const [chosen,setChosen]=useState<Move>('rock');
  const [history,setHistory]=useState<RoundMark[]>([]);
  const [overlay,setOverlay]=useState<Overlay>(null);
  useEffect(()=>{resetScore();},[resetScore]);
  useEffect(()=>{
    if(overlay)return;
    let timer:ReturnType<typeof setTimeout>|undefined;
    if(phase==='counting')timer=setTimeout(()=>{
      if(countdown<4)setCountdown(countdown+1);
      else {makeChoice(chosen);setPhase('reveal');}
    },countdown<4?600:900);
    if(phase==='reveal')timer=setTimeout(()=>setPhase('feedback'),650);
    if(phase==='feedback')timer=setTimeout(()=>{
      const state=useGameStore.getState().matchState;
      setHistory(p=>[...p,state.result as RoundMark]);
      const target=Math.ceil(state.maxRounds/2);
      if(state.userScore>=target||state.computerScore>=target||state.round>state.maxRounds){
        if(state.userScore>state.computerScore){incrementStreak();router.replace('/game/victory');}
        else if(state.userScore<state.computerScore){resetStreak();router.replace('/game/defeat');}
        else router.replace('/game/draw');
      }else{resetMatch();setPhase('selecting');}
    },1500);
    return()=>{if(timer)clearTimeout(timer);};
  },[phase,countdown,overlay,chosen,makeChoice,resetMatch,incrementStreak,resetStreak,router]);
  const restart=()=>{resetScore();resetMatch();setHistory([]);setPhase('selecting');setCountdown(1);setOverlay(null);};
  return <GameCanvas background="game_screen/grass_Background.png">
    <Arena mine={matchState.userChoice} opponent={matchState.computerChoice} phase={phase} countdown={countdown} history={history} maxRounds={matchState.maxRounds} name={userProfile.username} opponentName="BOT" result={matchState.result??undefined} onMove={move=>{setChosen(move);setCountdown(1);setPhase('counting');}} onPause={()=>setOverlay('pause')}/>
    <PauseOverlay state={overlay} setState={setOverlay} onResume={()=>setOverlay(null)} onRestart={restart} onQuit={()=>router.dismissTo('/home')}/>
  </GameCanvas>;
}

function OnlineRound({room,myUid,onError,onPause}:{room:Room;myUid:string;onError:()=>void;onPause:()=>void}) {
  const isHost=room.creator.uid===myUid;
  const choices=room.roundChoices[room.currentRound];
  const [phase,setPhase]=useState<Phase>('selecting');
  const [countdown,setCountdown]=useState(1);
  const [chosen,setChosen]=useState<Choice>(null);
  const both=!!choices?.creatorChoice&&!!choices?.joinerChoice;
  const myMove=(isHost?choices?.creatorChoice:choices?.joinerChoice)??chosen;
  const theirMove=(isHost?choices?.joinerChoice:choices?.creatorChoice)??null;
  const actualResult=choices?.creatorChoice&&choices.joinerChoice?winner(choices.creatorChoice,choices.joinerChoice):null;
  const result:RoundMark|undefined=actualResult==='draw'?'draw':actualResult?(actualResult===(isHost?'creator':'joiner')?'win':'lose'):undefined;
  useEffect(()=>{
    if(!both||room.status!=='playing')return;
    const timers=[setTimeout(()=>setPhase('counting'),0),setTimeout(()=>setCountdown(2),600),setTimeout(()=>setCountdown(3),1200),setTimeout(()=>setCountdown(4),1800),setTimeout(()=>setPhase('reveal'),2700),setTimeout(()=>setPhase('feedback'),3350),setTimeout(()=>{if(isHost)void settleOnlineRound(room.roomId,room.currentRound).catch(onError);},4850)];
    return()=>timers.forEach(clearTimeout);
  },[both,isHost,room.currentRound,room.roomId,room.status,onError]);
  const makeMove=async(move:Move)=>{
    if(phase!=='selecting')return;
    setChosen(move);setPhase('waiting');
    try{await updateDoc(roomRef(room.roomId),{[`roundChoices.${room.currentRound}.${isHost?'creatorChoice':'joinerChoice'}`]:move});}
    catch{setChosen(null);setPhase('selecting');onError();}
  };
  const history=Object.keys(room.roundWinners).sort((a,b)=>Number(a)-Number(b)).map(k=>room.roundWinners[k]==='draw'?'draw':room.roundWinners[k]===(isHost?'creator':'joiner')?'win':'lose') as RoundMark[];
  const me=isHost?room.creator:room.joiner,opponent=isHost?room.joiner:room.creator;
  return <Arena mine={myMove} opponent={theirMove} phase={phase} countdown={countdown} history={history} maxRounds={room.maxRounds} name={me?.username??'YOU'} opponentName={opponent?.username??'FRIEND'} result={result} onMove={makeMove} onPause={onPause}/>;
}

export function MultiplayerGameScreen() {
  const router=useRouter();
  const {roomId,myUid}=useLocalSearchParams<{roomId?:string;myUid?:string}>();
  const [room,setRoom]=useState<Room|null>(null);
  const [overlay,setOverlay]=useState<Overlay>(null);
  const [left,setLeft]=useState(false);
  const [leaving,setLeaving]=useState(false);
  const {setOnlineResult,setMaxRounds}=useGameStore();
  const fail=useCallback(()=>router.push({pathname:'/oops',params:{returnTo:'/online-lobby'}}),[router]);
  useEffect(()=>{
    if(!roomId||!myUid)return;
    return onSnapshot(roomRef(roomId),snapshot=>{
      if(!snapshot.exists()){setLeft(true);return;}
      const data=snapshot.data() as Room;
      const host=data.creator.uid===myUid;
      if(!host&&data.joiner?.uid!==myUid){setLeft(true);return;}
      setRoom(data);setMaxRounds(data.maxRounds);
      if(data.exits?.creatorExited||data.exits?.joinerExited){setLeft(true);return;}
      if(data.status==='finished'&&data.joiner&&!leaving){
        const me=host?data.creator:data.joiner,opponent=host?data.joiner:data.creator;
        setOnlineResult({roomId,myUid,matchId:data.matchId??0,me,opponent,outcome:me.score>opponent.score?'win':me.score<opponent.score?'lose':'draw'});
        router.replace('/game/online-result');
      }
    },fail);
  },[roomId,myUid,router,setOnlineResult,setMaxRounds,fail,leaving]);
  const quit=async()=>{
    setLeaving(true);
    try{if(roomId&&room)await updateDoc(roomRef(roomId),{[`exits.${room.creator.uid===myUid?'creatorExited':'joinerExited'}`]:true,status:'finished'});}
    catch{ /* Allow local exit even if connection was lost. */ }
    router.dismissTo('/home');
  };
  return <GameCanvas background="game_screen/grass_Background.png">
    {room&&myUid?<OnlineRound key={`${room.matchId??0}:${room.currentRound}`} room={room} myUid={myUid} onError={fail} onPause={()=>setOverlay('pause')}/>:<Label x={20} y={400} w={353} size={17}>CONNECTING...</Label>}
    <PauseOverlay state={overlay} setState={setOverlay} online onResume={()=>setOverlay(null)} onQuit={quit} onRestart={async()=>{await quit();router.replace('/online-lobby');}}/>
    {(left||!roomId||!myUid)&&<><Dimmer/><Enter from="scale"><Art asset="Oops_Screen/oops.png" x={15.5} y={289} w={362}/><View style={[box(38,352,315,62),{backgroundColor:'#ffda00'}]}><Label x={0} y={4} w={315} h={60} size={12}>YOUR FRIEND LEFT\nTHIS DUEL.</Label></View><ArtButton x={112.5} y={463} w={168.25} title="HOME" onPress={()=>router.dismissTo('/home')}/></Enter></>}
  </GameCanvas>;
}
