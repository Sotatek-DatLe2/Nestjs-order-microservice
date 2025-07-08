import { OrderStatus } from '../../common/order.enum';
export declare class OrderHistorySerializer {
    id: string;
    status: OrderStatus;
    createdAt: Date;
}
export declare class OrderSerializer {
    id: string;
    customerName: string;
    description: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    history: OrderHistorySerializer[];
}
