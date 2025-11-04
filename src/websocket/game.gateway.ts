import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameEngineService } from '../game/services/game-engine.service';
import { RedisService } from '../game/services/redis.service';
import { PlaceBetDto } from '../game/dto/place-bet.dto';
import { CashoutDto } from '../game/dto/cashout.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/game',
})
@UsePipes(new ValidationPipe({ transform: true }))
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private connectedClients = 0;

  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly redisService: RedisService,
  ) {}

  afterInit() {
    this.logger.log('🔌 WebSocket Gateway initialized');
    this.setupRedisSubscriptions();
  }

  /**
   * Setup Redis subscriptions for cross-instance communication
   */
  private setupRedisSubscriptions() {
    // New round started
    this.redisService.subscribe('round:new', (data) => {
      this.server.emit('round:new', data);
      this.logger.log(`📢 Broadcasting new round: #${data.roundNumber}`);
    });

    // Round flying
    this.redisService.subscribe('round:flying', (data) => {
      this.server.emit('round:flying', data);
      this.logger.log(`📢 Broadcasting flying round: ${data.roundId}`);
    });

    // Multiplier tick
    this.redisService.subscribe('multiplier:tick', (data) => {
      this.server.emit('multiplier:tick', data);
    });

    // Round crashed
    this.redisService.subscribe('round:crash', (data) => {
      this.server.emit('round:crash', data);
      this.logger.log(`📢 Broadcasting crash: ${data.crashPoint}x`);
    });

    // Bet placed
    this.redisService.subscribe('bet:placed', (data) => {
      this.server.emit('bet:placed', data);
    });

    // Bet cashed out
    this.redisService.subscribe('bet:cashout', (data) => {
      this.server.emit('bet:cashout', data);
    });
  }

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(`👤 Client connected: ${client.id} (Total: ${this.connectedClients})`);

    // Send current game state to new client
    const currentState = this.gameEngine.getCurrentState();
    const activeBets = this.gameEngine.getActiveBets();

    client.emit('game:state', {
      ...currentState,
      activeBets,
      connectedPlayers: this.connectedClients,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(`👤 Client disconnected: ${client.id} (Total: ${this.connectedClients})`);
  }

  /**
   * Handle place bet request
   */
  @SubscribeMessage('place:bet')
  async handlePlaceBet(
    @MessageBody() data: PlaceBetDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const bet = await this.gameEngine.placeBet(data.userId, data.username, data.amount);
      
      // Send confirmation to client
      client.emit('bet:success', {
        message: 'Bet placed successfully',
        bet,
      });

      this.logger.log(`✅ Bet placed: ${data.username} - ${data.amount}`);
    } catch (error) {
      this.logger.error(`❌ Failed to place bet: ${error.message}`);
      client.emit('bet:error', {
        message: error.message,
      });
    }
  }

  /**
   * Handle cashout request
   */
  @SubscribeMessage('cashout')
  async handleCashout(
    @MessageBody() data: CashoutDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.gameEngine.cashOut(data.userId);
      
      // Send confirmation to client
      client.emit('cashout:success', {
        message: 'Cashed out successfully',
        ...result,
      });

      this.logger.log(`✅ Cashout: ${data.userId} - ${result.multiplier}x`);
    } catch (error) {
      this.logger.error(`❌ Failed to cashout: ${error.message}`);
      client.emit('cashout:error', {
        message: error.message,
      });
    }
  }

  /**
   * Handle request for current game state
   */
  @SubscribeMessage('get:state')
  handleGetState(@ConnectedSocket() client: Socket) {
    const currentState = this.gameEngine.getCurrentState();
    const activeBets = this.gameEngine.getActiveBets();

    client.emit('game:state', {
      ...currentState,
      activeBets,
      connectedPlayers: this.connectedClients,
    });
  }
}
