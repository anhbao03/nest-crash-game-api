import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private publishClient: Redis;
  private subscribeClient: Redis;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    try {
      // Create publish client
      this.publishClient = new Redis(redisConfig);
      
      // Create subscribe client
      this.subscribeClient = new Redis(redisConfig);

      // Setup event listeners
      this.publishClient.on('connect', () => {
        this.logger.log('✅ Redis publish client connected');
      });

      this.subscribeClient.on('connect', () => {
        this.logger.log('✅ Redis subscribe client connected');
      });

      this.publishClient.on('error', (err) => {
        this.logger.error('❌ Redis publish client error:', err);
      });

      this.subscribeClient.on('error', (err) => {
        this.logger.error('❌ Redis subscribe client error:', err);
      });

      // Setup message handler
      this.subscribeClient.on('message', (channel, message) => {
        this.handleMessage(channel, message);
      });

      this.logger.log('🔌 Redis service initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis:', error);
    }
  }

  /**
   * Publish message to channel
   */
  async publish(channel: string, data: any): Promise<void> {
    try {
      const message = JSON.stringify(data);
      await this.publishClient.publish(channel, message);
    } catch (error) {
      this.logger.error(`Failed to publish to ${channel}:`, error);
    }
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channel: string, callback: (data: any) => void): Promise<void> {
    try {
      // Add callback to subscribers
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
        await this.subscribeClient.subscribe(channel);
        this.logger.log(`📡 Subscribed to channel: ${channel}`);
      }
      this.subscribers.get(channel).add(callback);
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${channel}:`, error);
    }
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channel: string, callback?: (data: any) => void): Promise<void> {
    try {
      if (callback) {
        // Remove specific callback
        const callbacks = this.subscribers.get(channel);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.subscribers.delete(channel);
            await this.subscribeClient.unsubscribe(channel);
            this.logger.log(`📴 Unsubscribed from channel: ${channel}`);
          }
        }
      } else {
        // Remove all callbacks for channel
        this.subscribers.delete(channel);
        await this.subscribeClient.unsubscribe(channel);
        this.logger.log(`📴 Unsubscribed from channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from ${channel}:`, error);
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(channel: string, message: string): void {
    try {
      const data = JSON.parse(message);
      const callbacks = this.subscribers.get(channel);
      
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            this.logger.error(`Error in callback for ${channel}:`, error);
          }
        });
      }
    } catch (error) {
      this.logger.error(`Failed to parse message from ${channel}:`, error);
    }
  }

  /**
   * Set value in Redis with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.publishClient.setex(key, ttl, stringValue);
      } else {
        await this.publishClient.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Failed to set ${key}:`, error);
    }
  }

  /**
   * Get value from Redis
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.publishClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete key from Redis
   */
  async delete(key: string): Promise<void> {
    try {
      await this.publishClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete ${key}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.publishClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of ${key}:`, error);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.publishClient.quit();
    await this.subscribeClient.quit();
    this.logger.log('👋 Redis service disconnected');
  }
}
