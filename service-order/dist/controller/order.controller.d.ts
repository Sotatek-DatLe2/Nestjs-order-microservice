import { OrderService } from '../models/Order/order.service';
import { CreateOrderDto } from '../models/Order/DTO/create-order.dto';
import { PaginationQueryDto } from '../models/Order/DTO/pagination-query.dto';
import { UpdateOrderStatusDto } from '../models/Order/DTO/update-order-status.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(createOrderDto: CreateOrderDto): Promise<void>;
    getOrders(paginationQuery: PaginationQueryDto): Promise<{
        data: import("../models/Order/order.serializer").OrderSerializer[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOrderById(id: string): Promise<import("../models/Order/order.serializer").OrderSerializer>;
    updateOrder(updateOrderDto: UpdateOrderStatusDto): Promise<import("../models/Order/order.serializer").OrderSerializer>;
}
