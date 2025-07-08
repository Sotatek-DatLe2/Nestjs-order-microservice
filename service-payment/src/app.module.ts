import { Module } from '@nestjs/common';
import { PaymentModule } from './models/payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaConsumerService } from './kafka/consumer.service';
import { KafkaProducerService } from './kafka/producer.service';
import { PaymentService } from './controller/payment.controller';
import { Logger } from '@nestjs/common';

@Module({
  imports: [PaymentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
