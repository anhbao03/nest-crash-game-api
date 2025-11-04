import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Round, RoundStatus } from '../../database/entities/round.entity';
import { Bet, BetStatus } from '../../database/entities/bet.entity';
import { ProvablyFairService } from './provably-fair.service';
import { RedisService } from './redis.service';
import { GameState, PlayerBet } from '../interfaces/game-state.interface';

@Injectable()
export class GameEngineService implements OnModuleInit {
  private readonly logger = new Logger(GameEngineService.name);
  private currentRound: GameState;
  private roundInterval: NodeJS.Timeout;
  private tickInterval: NodeJS.Timeout;
  private activeBets: Map<string, PlayerBet> = new Map();
  
  private readonly bettingDuration: number;
  private readonly tickRate: number;
  private readonly houseEdge: number;

  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    private readonly provablyFairService: ProvablyFairService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.bettingDuration = this.configService.get<number>('game.bettingDuration');
    this.tickRate = this.configService.get<number>('game.tickRate');
    this.houseEdge = this.configService.get<number>('game.houseEdge');
  }

  async onModuleInit() {
    this.logger.log('🎮 Game Engine initializing...');
    await this.initializeGame();
  }

  /**
   * Initialize game and start first round
   */
  private async initializeGame() {
    try {
      // Check if there's an active round
      const activeRound = await this.roundRepository.findOne({
        where: [
          { status: RoundStatus.BETTING },
          { status: RoundStatus.FLYING },
        ],
        order: { createdAt: 'DESC' },
      });

      if (activeRound) {
        this.logger.warn('Found active round, cleaning up...');
        activeRound.status = RoundStatus.ENDED;
        activeRound.endedAt = new Date();
        await this.roundRepository.save(activeRound);
      }

      // Start new round
      await this.startNewRound();
      this.logger.log('✅ Game Engine initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize game:', error);
    }
  }

  /**
   * Start a new round
   */
  private async startNewRound() {
    try {
      // Get last round number
      const lastRound = await this.roundRepository.findOne({
        order: { roundNumber: 'DESC' },
      });
      const nextRoundNumber = (lastRound?.roundNumber || 0) + 1;

      // Generate provably fair data
      const serverSeed = this.provablyFairService.generateServerSeed();
      const hash = this.provablyFairService.generateHash(serverSeed);
      const clientSeed = this.provablyFairService.generateClientSeed();
      const crashPoint = this.provablyFairService.calculateCrashPoint(
        serverSeed,
        clientSeed,
        nextRoundNumber,
        this.houseEdge,
      );

      // Create round in database
      const round = this.roundRepository.create({
        roundNumber: nextRoundNumber,
        crashPoint,
        status: RoundStatus.BETTING,
        serverSeed,
        clientSeed,
        hash,
      });

      const savedRound = await this.roundRepository.save(round);

      // Initialize game state
      this.currentRound = {
        roundId: savedRound.id,
        roundNumber: savedRound.roundNumber,
        status: 'betting',
        crashPoint: savedRound.crashPoint,
        currentMultiplier: 1.0,
        bettingEndsAt: Date.now() + this.bettingDuration,
      };

      // Clear active bets
      this.activeBets.clear();

      // Publish to Redis for multi-instance sync
      await this.redisService.publish('round:new', this.currentRound);

      this.logger.log(`🎲 Round #${nextRoundNumber} started - Crash at ${crashPoint}x`);

      // Schedule betting end
      setTimeout(() => this.startFlying(), this.bettingDuration);
    } catch (error) {
      this.logger.error('❌ Failed to start new round:', error);
      // Retry after 5 seconds
      setTimeout(() => this.startNewRound(), 5000);
    }
  }

  /**
   * Start flying phase (multiplier increasing)
   */
  private async startFlying() {
    try {
      // Update round status
      const round = await this.roundRepository.findOne({
        where: { id: this.currentRound.roundId },
      });

      if (!round) {
        this.logger.error('Round not found!');
        return;
      }

      round.status = RoundStatus.FLYING;
      round.startedAt = new Date();
      await this.roundRepository.save(round);

      // Update game state
      this.currentRound.status = 'flying';
      this.currentRound.startedAt = Date.now();

      // Publish to Redis
      await this.redisService.publish('round:flying', {
        roundId: this.currentRound.roundId,
        startedAt: this.currentRound.startedAt,
      });

      this.logger.log(`🚀 Round #${this.currentRound.roundNumber} is flying!`);

      // Start multiplier tick
      this.startMultiplierTick();
    } catch (error) {
      this.logger.error('❌ Failed to start flying:', error);
    }
  }

  /**
   * Start multiplier tick (update every tickRate ms)
   */
  private startMultiplierTick() {
    const startTime = this.currentRound.startedAt;

    this.tickInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const multiplier = this.provablyFairService.calculateMultiplier(elapsed);

      this.currentRound.currentMultiplier = multiplier;

      // Publish current multiplier to Redis
      await this.redisService.publish('multiplier:tick', {
        roundId: this.currentRound.roundId,
        multiplier,
        elapsed,
      });

      // Check if crash point reached
      if (multiplier >= this.currentRound.crashPoint) {
        clearInterval(this.tickInterval);
        await this.crash();
      }
    }, this.tickRate);
  }

  /**
   * Crash the game
   */
  private async crash() {
    try {
      this.logger.log(`💥 Round #${this.currentRound.roundNumber} crashed at ${this.currentRound.crashPoint}x`);

      // Update round status
      const round = await this.roundRepository.findOne({
        where: { id: this.currentRound.roundId },
      });

      if (round) {
        round.status = RoundStatus.ENDED;
        round.endedAt = new Date();
        await this.roundRepository.save(round);
      }

      // Update all pending bets to lost
      await this.betRepository.update(
        {
          roundId: this.currentRound.roundId,
          status: BetStatus.PENDING,
        },
        {
          status: BetStatus.LOST,
        },
      );

      // Update game state
      this.currentRound.status = 'ended';
      this.currentRound.endedAt = Date.now();

      // Publish crash event
      await this.redisService.publish('round:crash', {
        roundId: this.currentRound.roundId,
        crashPoint: this.currentRound.crashPoint,
        roundNumber: this.currentRound.roundNumber,
      });

      // Wait 3 seconds before starting new round
      setTimeout(() => this.startNewRound(), 3000);
    } catch (error) {
      this.logger.error('❌ Failed to crash:', error);
    }
  }

  /**
   * Place a bet
   */
  async placeBet(userId: string, username: string, amount: number): Promise<PlayerBet> {
    // Validate betting phase
    if (this.currentRound.status !== 'betting') {
      throw new Error('Betting phase has ended');
    }

    // Check if user already bet this round
    if (this.activeBets.has(userId)) {
      throw new Error('You have already placed a bet this round');
    }

    // Create bet in database
    const bet = this.betRepository.create({
      userId,
      roundId: this.currentRound.roundId,
      amount,
      status: BetStatus.PENDING,
    });

    const savedBet = await this.betRepository.save(bet);

    // Add to active bets
    const playerBet: PlayerBet = {
      userId,
      username,
      amount,
      betId: savedBet.id,
      cashedOut: false,
    };

    this.activeBets.set(userId, playerBet);

    // Publish to Redis
    await this.redisService.publish('bet:placed', playerBet);

    this.logger.log(`💰 User ${username} bet ${amount} on round #${this.currentRound.roundNumber}`);

    return playerBet;
  }

  /**
   * Cash out a bet
   */
  async cashOut(userId: string): Promise<{ payout: number; multiplier: number }> {
    // Validate flying phase
    if (this.currentRound.status !== 'flying') {
      throw new Error('Cannot cash out during this phase');
    }

    // Check if user has active bet
    const playerBet = this.activeBets.get(userId);
    if (!playerBet) {
      throw new Error('No active bet found');
    }

    if (playerBet.cashedOut) {
      throw new Error('Already cashed out');
    }

    // Calculate payout
    const multiplier = this.currentRound.currentMultiplier;
    const payout = playerBet.amount * multiplier;

    // Update bet in database
    await this.betRepository.update(
      { id: playerBet.betId },
      {
        status: BetStatus.CASHED_OUT,
        cashoutMultiplier: multiplier,
        payout,
        cashedOutAt: new Date(),
      },
    );

    // Update active bet
    playerBet.cashedOut = true;
    playerBet.cashoutMultiplier = multiplier;
    playerBet.payout = payout;

    // Publish to Redis
    await this.redisService.publish('bet:cashout', {
      userId,
      username: playerBet.username,
      multiplier,
      payout,
      roundId: this.currentRound.roundId,
    });

    this.logger.log(`💸 User ${playerBet.username} cashed out at ${multiplier}x (${payout})`);

    return { payout, multiplier };
  }

  /**
   * Get current game state
   */
  getCurrentState(): GameState {
    return { ...this.currentRound };
  }

  /**
   * Get active bets for current round
   */
  getActiveBets(): PlayerBet[] {
    return Array.from(this.activeBets.values());
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    if (this.roundInterval) {
      clearInterval(this.roundInterval);
    }
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
  }
}
