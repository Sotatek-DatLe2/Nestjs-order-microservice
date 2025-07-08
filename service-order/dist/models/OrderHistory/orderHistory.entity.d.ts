import { Order } from '../Order/order.entity';
import { OrderStatus } from '../../common/order.enum';
export declare class OrderHistory {
    id: string;
    status: OrderStatus;
    createdAt: Date;
    order: Order;
}
