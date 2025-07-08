import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from 'common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from 'common/filters/http-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KafkaConsumerService } from './kafka/consumer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'payment-service',
      brokers: ['kafka:9092'],
    },
    consumer: {
      groupId: 'payment-consumer',
    },
  },
});
  app.get(KafkaConsumerService);
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
