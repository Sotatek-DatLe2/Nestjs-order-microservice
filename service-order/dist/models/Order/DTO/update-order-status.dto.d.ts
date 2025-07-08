import { OrderStatus } from '../../../common/order.enum';
export declare class UpdateOrderStatusDto {
    id: string;
    reason: string;
    status: OrderStatus;
    refundAmount: number;
}
