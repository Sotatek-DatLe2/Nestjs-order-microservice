import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { KafkaTopics } from './kafka-topics';
import { PaymentService } from '../models/payment/payment.service';
import { KafkaProducerService } from './producer.service';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: any;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly kafkaProducer: KafkaProducerService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.logger.log('KafkaConsumerService in payment initialized');
  }

  async onModuleInit() {
    this.logger.log('Subscribing to order.payment.verify');
    const kafka = new Kafka({
      clientId: 'payment-service',
      brokers: ['kafka:9092'],
    });
    this.consumer = kafka.consumer({ groupId: 'payment-consumer' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: KafkaTopics.ORDER_PAYMENT_VERIFY, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.logger.log(`Received message on ${topic}, partition ${partition}, offset ${message.offset}`);
        const payload = JSON.parse(message.value.toString());
        await this.handleVerifyPayment(payload, { getPartition: () => partition, getMessage: () => ({ offset: message.offset }) } as any);
      },
    });
  }

  @EventPattern(KafkaTopics.ORDER_PAYMENT_VERIFY)
  async handleVerifyPayment(@Payload() payload: any, @Ctx() context: KafkaContext) {
    try {
      const result = this.paymentService.verifyPayment(payload.paymentDetails);
      this.logger.log(`Payment verification result: ${JSON.stringify(result)}`);

      await this.kafkaProducer.emitPaymentVerified({
        orderId: payload.orderId,
        status: result.status,
        message: result.message,
      });
    } catch (error) {
      this.logger.error(`Error processing payment: ${error.message}`);
    }
  }
}