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
  gameMode: 'single' | 'multi';
}

export interface GameStore {
  userSession: any | null;
  matchState: MatchState;
  winStreak: number;
  setUserSession: (session: any) => void;
  makeChoice: (choice: 'rock' | 'paper' | 'scissors') => void;
  resetMatch: () => void;
  resetScore: () => void;
  setGameMode: (mode: 'single' | 'multi') => void;
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
  gameMode: 'single',
};

export const useGameStore = create<GameStore>((set) => ({
  userSession: null,
  matchState: initialMatchState,
  winStreak: 0,
  setUserSession: (session) => set({ userSession: session }),
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
    }
  })),
  setGameMode: (gameMode) => set((state) => ({
    matchState: {
      ...state.matchState,
      gameMode,
    }
  })),
  incrementStreak: () => set((state) => ({ winStreak: state.winStreak + 1 })),
  resetStreak: () => set({ winStreak: 0 }),
}));
