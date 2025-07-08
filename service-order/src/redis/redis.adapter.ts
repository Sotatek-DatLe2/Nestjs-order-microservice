// redis.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';
import { INestApplication, Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private corsOptions: Partial<ServerOptions> = {};
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;

  constructor(app: INestApplication) {
    super(app);
  }

  configureCors(options: { origin?: string | string[]; credentials?: boolean }) {
    this.corsOptions = {
      cors: {
        origin: options.origin,
        credentials: options.credentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      },
    };
  }

  async connectToRedis(): Promise<void> {
    if (this.pubClient && this.subClient) {
      this.logger.log('Redis clients already connected');
      return;
    }

    const redisUrl = `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || '6379'}`;
    this.pubClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD, // Add if Redis requires auth
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // Exponential backoff
      },
    });
    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('error', (err) => this.logger.error('Redis Pub Client Error:', err));
    this.subClient.on('error', (err) => this.logger.error('Redis Sub Client Error:', err));
    this.pubClient.on('connect', () => this.logger.log('Redis Pub Client Connected'));
    this.subClient.on('connect', () => this.logger.log('Redis Sub Client Connected'));

    try {
      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.logger.log('Redis adapter initialized');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: this.corsOptions,
      pingInterval: 10000,
      pingTimeout: 5000,
    }) as Server;

    if (!this.adapterConstructor) {
      throw new Error('Redis adapter not initialized. Call connectToRedis first.');
    }

    server.adapter(this.adapterConstructor);
    server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);
      socket.on('disconnect', () => this.logger.log(`Client disconnected: ${socket.id}`));
    });

    return server;
  }

  async close(): Promise<void> {
    if (this.pubClient && this.subClient) {
      await Promise.all([this.pubClient.quit(), this.subClient.quit()]);
      this.logger.log('Redis clients disconnected');
      this.pubClient = null;
      this.subClient = null;
      this.adapterConstructor = null;
    }
  }
}