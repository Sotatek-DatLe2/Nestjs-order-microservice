import { OrderHistory } from '../OrderHistory/orderHistory.entity';
export declare class Order {
    id: string;
    customerName: string;
    description: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    history: OrderHistory[];
}
