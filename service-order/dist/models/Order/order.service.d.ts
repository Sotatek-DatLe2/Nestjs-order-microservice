import { HttpService } from '@nestjs/axios';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './DTO/create-order.dto';
import { UpdateOrderStatusDto } from './DTO/update-order-status.dto';
import { FilterOptions } from '../../util/filter.interface';
import { OrderStatus } from '../../common/order.enum';
import { Queue } from 'bullmq';
export declare class OrderService {
    private readonly orderRepository;
    private readonly httpService;
    private readonly orderStatusQueue;
    private readonly logger;
    constructor(orderRepository: OrderRepository, httpService: HttpService, orderStatusQueue: Queue);
    createOrder(dto: CreateOrderDto): Promise<{
        status: OrderStatus;
        reason: string | undefined;
        id: string;
        customerName: string;
        description: string;
        totalAmount: number;
        createdAt: Date;
        updatedAt: Date;
        history: import("./order.serializer").OrderHistorySerializer[];
    }>;
    getOrder(id: string): Promise<import("./order.serializer").OrderSerializer>;
    updateOrderStatus(dto: UpdateOrderStatusDto): Promise<import("./order.serializer").OrderSerializer>;
    getOrders({ page, limit, filter, }: {
        page: number;
        limit: number;
        filter: FilterOptions;
    }): Promise<{
        data: import("./order.serializer").OrderSerializer[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
