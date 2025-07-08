// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisIoAdapter } from './redis/redis.adapter';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3003',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'order-service',
        brokers: ['kafka:9092'],
      },
      consumer: {
        groupId: 'order-consumer',
      },
    },
  });
  const redisIoAdapter = new RedisIoAdapter(app);
  redisIoAdapter.configureCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3003', 
    credentials: true,
  });
  try {
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
  } catch (error) {
    this.logger.log('Failed to connect RedisIoAdapter:', error);
    throw error;
  }

  await app.startAllMicroservices();
  await app.listen(3002);

  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM. Shutting down...');
    await redisIoAdapter.close();
    await app.close();
    process.exit(0);
  });
}
bootstrap();
