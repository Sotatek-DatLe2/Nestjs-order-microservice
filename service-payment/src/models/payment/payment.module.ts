import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { KafkaConsumerService } from 'src/kafka/consumer.service';
import { KafkaProducerService } from 'src/kafka/producer.service';
import { Logger } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-service-producer',
            brokers: ['kafka:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [
    KafkaConsumerService,
    KafkaProducerService,
    PaymentService,
    Logger,
  ],
  exports: [PaymentService, KafkaConsumerService, KafkaProducerService],
})
export class PaymentModule {}
