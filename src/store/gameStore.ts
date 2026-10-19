import { create } from 'zustand';

export type Choice = 'rock' | 'paper' | 'scissors' | null;
export type GameResult = 'win' | 'lose' | 'draw' | null;

export interface MatchState {
  userChoice: Choice;
  computerChoice: Choice;
  result: GameResult;
  userScore: number;
  computerScore: number;
  round: number;
  maxRounds: number;
  gameMode: 'single' | 'multi';
}

export interface UserProfile {
  username: string;
  crowns: number;
  gender?: 'male' | 'female';
}

export interface OnlineMatchResult {
  roomId: string;
  myUid: string;
  matchId: number;
  outcome: 'win' | 'lose' | 'draw';
  me: UserProfile & { uid: string; score: number };
  opponent: UserProfile & { uid: string; score: number };
}

export interface GameStore {
  userSession: any | null;
  userProfile: UserProfile;
  matchState: MatchState;
  winStreak: number;
  onlineResult: OnlineMatchResult | null;
  /** Rounds the host just picked for a new online room; the lobby consumes it to create the room. */
  pendingRoomRounds: number | null;
  /** Screenshot of the result screen taken when Share was tapped (file URI on phones, data URI on web). */
  shareImage: string | null;
  setShareImage: (uri: string | null) => void;
  setPendingRoomRounds: (rounds: number | null) => void;
  setOnlineResult: (result: OnlineMatchResult) => void;
  setUserSession: (session: any) => void;
  setUserProfile: (profile: UserProfile) => void;
  makeChoice: (choice: 'rock' | 'paper' | 'scissors') => void;
  resetMatch: () => void;
  resetScore: () => void;
  setGameMode: (mode: 'single' | 'multi') => void;
  setMaxRounds: (maxRounds: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

const initialMatchState: MatchState = {
  userChoice: null,
  computerChoice: null,
  result: null,
  userScore: 0,
  computerScore: 0,
  round: 1,
  maxRounds: 3,
  gameMode: 'single',
};

export const useGameStore = create<GameStore>((set) => ({
  userSession: null,
  userProfile: { username: "PLAYER", crowns: 0, gender: 'male' },
  matchState: initialMatchState,
  winStreak: 0,
  onlineResult: null,
  pendingRoomRounds: null,
  shareImage: null,
  setShareImage: (shareImage) => set({ shareImage }),
  setPendingRoomRounds: (pendingRoomRounds) => set({ pendingRoomRounds }),
  setOnlineResult: (onlineResult) => set((state) => ({
    onlineResult,
    winStreak: state.onlineResult?.roomId === onlineResult.roomId && state.onlineResult?.matchId === onlineResult.matchId
      ? state.winStreak
      : onlineResult.outcome === 'win' ? state.winStreak + 1 : onlineResult.outcome === 'lose' ? 0 : state.winStreak,
    matchState: { ...state.matchState, gameMode: 'multi', userScore: onlineResult.me.score, computerScore: onlineResult.opponent.score },
  })),
  setUserSession: (session) => set({ userSession: session }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  makeChoice: (userChoice) => set((state) => {
    const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    
    let result: GameResult = 'draw';
    if (userChoice !== computerChoice) {
      if (
        (userChoice === 'rock' && computerChoice === 'scissors') ||
        (userChoice === 'paper' && computerChoice === 'rock') ||
        (userChoice === 'scissors' && computerChoice === 'paper')
      ) {
        result = 'win';
      } else {
        result = 'lose';
      }
    }

    const nextUserScore = result === 'win' ? state.matchState.userScore + 1 : state.matchState.userScore;
    const nextComputerScore = result === 'lose' ? state.matchState.computerScore + 1 : state.matchState.computerScore;

    return {
      matchState: {
        ...state.matchState,
        userChoice,
        computerChoice,
        result,
        userScore: nextUserScore,
        computerScore: nextComputerScore,
        round: state.matchState.round + 1,
      }
    };
  }),
  resetMatch: () => set((state) => ({
    matchState: {
      ...state.matchState,
      userChoice: null,
      computerChoice: null,
      result: null,
    }
  })),
  resetScore: () => set((state) => ({
    matchState: {
      ...initialMatchState,
      gameMode: state.matchState.gameMode,
      maxRounds: state.matchState.maxRounds,
    }
  })),
  setGameMode: (gameMode) => set((state) => ({
    matchState: {
      ...state.matchState,
      gameMode,
    }
  })),
  setMaxRounds: (maxRounds) => set((state) => ({
    matchState: {
      ...state.matchState,
      maxRounds,
    }
  })),
  incrementStreak: () => set((state) => ({ winStreak: state.winStreak + 1 })),
  resetStreak: () => set({ winStreak: 0 }),
}));
