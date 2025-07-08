import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';
import { OrderService } from '../models/Order/order.service';
import { KafkaTopics } from '../kafka/kafka-topics';
import { PaymentVerifiedEvent, PaymentStatus } from './types/payment-verified-event';
import { UpdateOrderStatusDto } from 'src/models/Order/DTO/update-order-status.dto';
import { OrderStatus } from 'src/common/order.enum';
import { DashboardGateway } from '../socket/dashboard.gateway';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: any;
  private readonly dashboardGateway : DashboardGateway;

  constructor(private readonly orderService: OrderService, dashboardGateway: DashboardGateway) {
    this.logger.log('OrderKafkaConsumerService initialized');
    this.dashboardGateway = dashboardGateway;
  }

  async onModuleInit() {
    this.logger.log('Subscribing to payment.verified');
    const kafka = new Kafka({
      clientId: 'order-service',
      brokers: ['kafka:9092'],
    });
    this.consumer = kafka.consumer({ groupId: 'order-consumer' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: KafkaTopics.PAYMENT_VERIFIED, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.logger.log(
          `Received message on ${topic}, partition ${partition}, offset ${message.offset}`,
        );
        const payload: PaymentVerifiedEvent = JSON.parse(message.value.toString());
        await this.handlePaymentVerified(payload, {
          getPartition: () => partition,
          getMessage: () => ({ offset: message.offset }),
        } as any);
      },
    });
  }

  @EventPattern(KafkaTopics.PAYMENT_VERIFIED)
  async handlePaymentVerified(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const { orderId, status, message } = payload.data;
      this.logger.log(`Received payment.verified for order ${orderId}: ${status}, Partition: ${context.getPartition()}, Offset: ${context.getMessage().offset}`);
      this.logger.log(`Full payload: ${JSON.stringify(payload)}`);

      const newStatus = status === PaymentStatus.CONFIRMED ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
      const updateOrderStatus: UpdateOrderStatusDto = {
        id: orderId,
        status: newStatus,
        reason: message || 'Payment processed',
      };

      const updatedOrder = await this.orderService.updateOrderStatus(updateOrderStatus, status, payload.message);
      
      this.dashboardGateway.emitOrderUpdated(updatedOrder);
      this.logger.log(`Order ${orderId} updated to status ${newStatus}`);
    } catch (error) {
      this.logger.error(
        `Failed to process payment.verified for order ${payload.orderId}: ${error.message}`,
      );
    }
  }
}
