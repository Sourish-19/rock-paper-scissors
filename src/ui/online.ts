import { doc, runTransaction, type DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Choice, UserProfile } from '@/store/gameStore';

export type Move = NonNullable<Choice>;
export type Player = UserProfile & { uid: string; score: number };
export type Room = {
  roomId: string; status: 'waiting' | 'ready' | 'playing' | 'finished'; maxRounds: number;
  currentRound: number; creator: Player; joiner: Player | null; createdAt: number; matchId?: number;
  roundChoices: Record<string, { creatorChoice?: Move; joinerChoice?: Move }>;
  roundWinners: Record<string, 'creator' | 'joiner' | 'draw'>;
  exits: { creatorExited: boolean; joinerExited: boolean };
  rematch?: { requestedBy: string; deniedBy?: string } | null;
};
export const winner = (a: Move, b: Move) => a === b ? 'draw' : (a === 'rock' && b === 'scissors') || (a === 'paper' && b === 'rock') || (a === 'scissors' && b === 'paper') ? 'creator' : 'joiner';
export const roomRef = (code: string): DocumentReference => doc(db,'rooms',code);

export async function settleOnlineRound(code: string, round: number) {
  await runTransaction(db, async transaction => {
    const ref = roomRef(code);
    const snapshot = await transaction.get(ref);
    if(!snapshot.exists())return;
    const data = snapshot.data() as Room;
    const moves = data.roundChoices[round];
    if(data.status!=='playing' || data.currentRound!==round || data.roundWinners[round] || !data.joiner || !moves?.creatorChoice || !moves.joinerChoice)return;
    const result = winner(moves.creatorChoice,moves.joinerChoice);
    const creatorScore = data.creator.score + (result==='creator'?1:0);
    const joinerScore = data.joiner.score + (result==='joiner'?1:0);
    const finished = creatorScore>=Math.ceil(data.maxRounds/2) || joinerScore>=Math.ceil(data.maxRounds/2) || round>=data.maxRounds;
    transaction.update(ref, { [`roundWinners.${round}`]: result, 'creator.score':creatorScore, 'joiner.score':joinerScore, status:finished?'finished':'playing', currentRound:finished?round:round+1 });
  });
}

export async function acceptRematch(code: string, uid: string) {
  await runTransaction(db, async transaction => {
    const ref = roomRef(code);
    const snapshot = await transaction.get(ref);
    if(!snapshot.exists())throw new Error('Room no longer exists');
    const room = snapshot.data() as Room;
    if(room.status!=='finished'||!room.joiner||!room.rematch||room.rematch.requestedBy===uid||![room.creator.uid,room.joiner.uid].includes(uid))return;
    transaction.update(ref,{status:'playing',currentRound:1,'creator.score':0,'joiner.score':0,roundChoices:{},roundWinners:{},exits:{creatorExited:false,joinerExited:false},rematch:null,matchId:(room.matchId??0)+1});
  });
}
