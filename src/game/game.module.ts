import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Round } from '../database/entities/round.entity';
import { Bet } from '../database/entities/bet.entity';
import { User } from '../database/entities/user.entity';
import { GameEngineService } from './services/game-engine.service';
import { ProvablyFairService } from './services/provably-fair.service';
import { RedisService } from './services/redis.service';
import { GameController } from './game.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Round, Bet, User]),
  ],
  controllers: [GameController],
  providers: [
    GameEngineService,
    ProvablyFairService,
    RedisService,
  ],
  exports: [
    GameEngineService,
    ProvablyFairService,
    RedisService,
  ],
})
export class GameModule {}
