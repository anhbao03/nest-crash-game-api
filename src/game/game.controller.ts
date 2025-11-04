import { Controller, Get, Post, Query, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../database/entities/round.entity';
import { Bet } from '../database/entities/bet.entity';
import { User } from '../database/entities/user.entity';
import { GameEngineService } from './services/game-engine.service';
import { ProvablyFairService } from './services/provably-fair.service';

@Controller('api/game')
export class GameController {
  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly gameEngine: GameEngineService,
    private readonly provablyFairService: ProvablyFairService,
  ) {}

  /**
   * Get current game state
   */
  @Get('state')
  getCurrentState() {
    const state = this.gameEngine.getCurrentState();
    const activeBets = this.gameEngine.getActiveBets();

    return {
      success: true,
      data: {
        ...state,
        activeBets,
      },
    };
  }

  /**
   * Get round history
   */
  @Get('rounds')
  async getRounds(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [rounds, total] = await this.roundRepository.findAndCount({
      order: { roundNumber: 'DESC' },
      take: limit,
      skip,
    });

    return {
      success: true,
      data: {
        rounds,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get specific round details
   */
  @Get('rounds/:id')
  async getRoundDetails(@Param('id') id: string) {
    const round = await this.roundRepository.findOne({
      where: { id },
      relations: ['bets', 'bets.user'],
    });

    if (!round) {
      throw new HttpException('Round not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: round,
    };
  }

  /**
   * Get user's bet history
   */
  @Get('bets/user/:userId')
  async getUserBets(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [bets, total] = await this.betRepository.findAndCount({
      where: { userId },
      relations: ['round'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    // Calculate statistics
    const stats = await this.betRepository
      .createQueryBuilder('bet')
      .select('COUNT(*)', 'totalBets')
      .addSelect('SUM(CASE WHEN status = \'cashed_out\' THEN 1 ELSE 0 END)', 'wins')
      .addSelect('SUM(amount)', 'totalWagered')
      .addSelect('SUM(CASE WHEN status = \'cashed_out\' THEN payout ELSE 0 END)', 'totalWon')
      .where('bet.userId = :userId', { userId })
      .getRawOne();

    return {
      success: true,
      data: {
        bets,
        stats: {
          totalBets: parseInt(stats.totalBets),
          wins: parseInt(stats.wins),
          losses: parseInt(stats.totalBets) - parseInt(stats.wins),
          totalWagered: parseFloat(stats.totalWagered || 0),
          totalWon: parseFloat(stats.totalWon || 0),
          profit: parseFloat(stats.totalWon || 0) - parseFloat(stats.totalWagered || 0),
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Verify round fairness
   */
  @Post('verify')
  verifyRound(
    @Body() body: {
      serverSeed: string;
      clientSeed: string;
      roundNumber: number;
      crashPoint: number;
    },
  ) {
    const { serverSeed, clientSeed, roundNumber, crashPoint } = body;

    const isValid = this.provablyFairService.verifyCrashPoint(
      serverSeed,
      clientSeed,
      roundNumber,
      crashPoint,
    );

    const calculatedCrashPoint = this.provablyFairService.calculateCrashPoint(
      serverSeed,
      clientSeed,
      roundNumber,
    );

    return {
      success: true,
      data: {
        isValid,
        provided: {
          serverSeed,
          clientSeed,
          roundNumber,
          crashPoint,
        },
        calculated: {
          crashPoint: calculatedCrashPoint,
          hash: this.provablyFairService.generateHash(serverSeed),
        },
      },
    };
  }

  /**
   * Get leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('period') period: string = 'all', // all, today, week, month
    @Query('limit') limit: number = 10,
  ) {
    let dateFilter = '';
    
    switch (period) {
      case 'today':
        dateFilter = "AND bet.createdAt >= NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "AND bet.createdAt >= NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND bet.createdAt >= NOW() - INTERVAL '30 days'";
        break;
    }

    const leaderboard = await this.betRepository
      .createQueryBuilder('bet')
      .select('bet.userId', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(*)', 'totalBets')
      .addSelect('SUM(bet.amount)', 'totalWagered')
      .addSelect('SUM(CASE WHEN bet.status = \'cashed_out\' THEN bet.payout ELSE 0 END)', 'totalWon')
      .addSelect('SUM(CASE WHEN bet.status = \'cashed_out\' THEN bet.payout ELSE 0 END) - SUM(bet.amount)', 'profit')
      .leftJoin('bet.user', 'user')
      .where(`1=1 ${dateFilter}`)
      .groupBy('bet.userId')
      .addGroupBy('user.username')
      .orderBy('profit', 'DESC')
      .limit(limit)
      .getRawMany();

    return {
      success: true,
      data: {
        leaderboard: leaderboard.map((row, index) => ({
          rank: index + 1,
          userId: row.userId,
          username: row.username,
          totalBets: parseInt(row.totalBets),
          totalWagered: parseFloat(row.totalWagered || 0),
          totalWon: parseFloat(row.totalWon || 0),
          profit: parseFloat(row.profit || 0),
        })),
        period,
      },
    };
  }

  /**
   * Get game statistics
   */
  @Get('stats')
  async getStats() {
    const totalRounds = await this.roundRepository.count();
    const totalBets = await this.betRepository.count();
    const totalUsers = await this.userRepository.count();

    const betStats = await this.betRepository
      .createQueryBuilder('bet')
      .select('SUM(bet.amount)', 'totalWagered')
      .addSelect('SUM(CASE WHEN bet.status = \'cashed_out\' THEN bet.payout ELSE 0 END)', 'totalWon')
      .addSelect('AVG(bet.amount)', 'avgBet')
      .addSelect('MAX(bet.payout)', 'biggestWin')
      .getRawOne();

    const roundStats = await this.roundRepository
      .createQueryBuilder('round')
      .select('AVG(round.crashPoint)', 'avgCrashPoint')
      .addSelect('MAX(round.crashPoint)', 'maxCrashPoint')
      .addSelect('MIN(round.crashPoint)', 'minCrashPoint')
      .getRawOne();

    return {
      success: true,
      data: {
        totalRounds,
        totalBets,
        totalUsers,
        totalWagered: parseFloat(betStats.totalWagered || 0),
        totalWon: parseFloat(betStats.totalWon || 0),
        houseProfit: parseFloat(betStats.totalWagered || 0) - parseFloat(betStats.totalWon || 0),
        avgBet: parseFloat(betStats.avgBet || 0),
        biggestWin: parseFloat(betStats.biggestWin || 0),
        avgCrashPoint: parseFloat(roundStats.avgCrashPoint || 0),
        maxCrashPoint: parseFloat(roundStats.maxCrashPoint || 0),
        minCrashPoint: parseFloat(roundStats.minCrashPoint || 0),
      },
    };
  }
}
