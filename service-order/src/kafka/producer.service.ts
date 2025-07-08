import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaTopics } from './kafka-topics';
import { PaymentDetails } from './types/payment-verified-payload';

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.ORDER_PAYMENT_VERIFY);
    await this.kafkaClient.connect();
  }

  async emitVerifyPayment(payload: { orderId: string; paymentDetails: PaymentDetails }) {
    this.logger.log(`Emitting payment verification for order ${payload.orderId}`);
    this.kafkaClient.emit(KafkaTopics.ORDER_PAYMENT_VERIFY, payload);
  }
}
