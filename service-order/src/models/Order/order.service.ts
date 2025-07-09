import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './DTO/create-order.dto';
import { UpdateOrderStatusDto } from './DTO/update-order-status.dto';
import { FilterOptions } from 'src/util/filter.interface';
import { OrderStatus} from '../../common/order.enum';
import { DashboardGateway } from '../../socket/dashboard.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { KafkaProducerService } from '../../kafka/producer.service';
import { PaymentDetails } from '../../kafka/types/payment-verified-payload';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly kafkaProducer: KafkaProducerService,
    @InjectQueue('order-status-delivered') private readonly orderStatusQueue: Queue,
    private readonly dashboardGateway: DashboardGateway,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const createdOrder = await this.orderRepository.createEntity(dto);
    this.logger.log('Created Order:', createdOrder);

    const paymentDetails: PaymentDetails = {
      cvv: dto.paymentDetails.cvv,
      cardNumber: dto.paymentDetails.cardNumber,
      expirationDate: dto.paymentDetails.expirationDate,
    };
 
    await this.kafkaProducer.emitVerifyPayment({
      orderId: createdOrder.id,
      paymentDetails: paymentDetails,
    });

    this.logger.log(`Payment verification request sent for order ${createdOrder.id}`);
    const orderResponse = {
      ...createdOrder,
      status: OrderStatus.CREATED,
      reason: 'Waiting for payment verification...',
    };
    this.dashboardGateway.emitOrderCreated(orderResponse);

    return {
      ...createdOrder,
      status: OrderStatus.CREATED,
      reason: 'Waiting for payment verification...',
    };
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto, status: string, message: any) {
    if (!dto.id) {
      throw new BadRequestException('Order ID is required for update');
    }
    const order = await this.orderRepository.get(dto.id);
    if (!order) {
      throw new NotFoundException(`Order with id ${dto.id} not found`);
    }

    if (dto.status === OrderStatus.CONFIRMED) {
      try {
        await this.orderStatusQueue.add(
          'order-status-delivered',
          { orderId: dto.id },
          { delay: 10000 },
        );
        this.logger.log(`Scheduled DELIVERED status update for order ${dto.id}`);
      } catch (err) {
        this.logger.error('Failed to schedule DELIVERED job:', err?.message || err);
        throw new BadRequestException('Failed to schedule order delivery update');
      }
    }
    this.dashboardGateway.emitOrderUpdated({
      ...order,
      status: dto.status,
      reason: message || 'No reason provided',
    });

    return this.orderRepository.updateStatus(dto.id, dto.status);
  }

  async getOrder(id: string) {
    const order = await this.orderRepository.get(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async getOrders({
    page = 1,
    limit = 10,
    filter,
  }: {
    page: number;
    limit: number;
    filter: FilterOptions;
  }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.orderRepository.findWithPagination(skip, limit, filter);

    if (!data || data.length === 0) {
      this.logger.warn('No orders found with the given filter:', filter);
      return {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
