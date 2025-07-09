import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderRepository } from '../models/Order/order.repository';
import { OrderStatus } from '../common/order.enum';
import { DashboardGateway } from '../socket/dashboard.gateway';

@Processor('order-status-delivered')
export class OrderProcessor extends WorkerHost {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dashboardGateway: DashboardGateway,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { orderId } = job.data;

    await this.orderRepository.updateStatus(orderId, OrderStatus.DELIVERED);
    this.dashboardGateway.emitOrderUpdated({
      id: orderId,
      status: OrderStatus.DELIVERED,
      reason: 'Order has been delivered',
    });
  }
}
