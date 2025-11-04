export interface GameState {
  roundId: string;
  roundNumber: number;
  status: 'betting' | 'flying' | 'ended';
  crashPoint: number;
  currentMultiplier: number;
  startedAt?: number;
  endedAt?: number;
  bettingEndsAt?: number;
}

export interface PlayerBet {
  userId: string;
  username: string;
  amount: number;
  betId: string;
  cashedOut: boolean;
  cashoutMultiplier?: number;
  payout?: number;
}

export interface RoundResult {
  roundId: string;
  roundNumber: number;
  crashPoint: number;
  totalBets: number;
  totalWagered: number;
  totalPayout: number;
}
