import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaTopics } from './kafka-topics';
import { PaymentVerifiedEvent } from './payment-verified-event';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.PAYMENT_VERIFIED);
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected');
  }

  async emitPaymentVerified(payload: PaymentVerifiedEvent) {
    try {
      this.logger.log(`Emitting payment.verified event: ${JSON.stringify(payload)}`);
      await this.kafkaClient.emit(KafkaTopics.PAYMENT_VERIFIED, {
        value: { data: payload },
      });
      this.logger.log(`Successfully emitted payment.verified for order ${payload.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to emit payment.verified: ${error.message}`);
    }
  }
}