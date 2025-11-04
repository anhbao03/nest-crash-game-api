import { registerAs } from '@nestjs/config';

export default registerAs('game', () => ({
  bettingDuration: parseInt(process.env.BETTING_DURATION, 10) || 5000,
  minBet: parseInt(process.env.MIN_BET, 10) || 10,
  maxBet: parseInt(process.env.MAX_BET, 10) || 100000,
  houseEdge: parseFloat(process.env.HOUSE_EDGE) || 0.01,
  tickRate: 100, // Update multiplier every 100ms
}));
