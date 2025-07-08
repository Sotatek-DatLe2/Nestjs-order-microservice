import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './producer.service';
import { KafkaConsumerService } from './consumer.service';
import { OrdersModule } from '../models/orders.module';
import { BullModule } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-service',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
          },
          consumer: {
            groupId: 'order-consumer',
          },
        },
      },
    ]),
    forwardRef(() => OrdersModule),
    BullModule.registerQueue({
      name: 'order-status-delivered', 
    }),
  ],
  providers: [KafkaProducerService, KafkaConsumerService, Logger],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
