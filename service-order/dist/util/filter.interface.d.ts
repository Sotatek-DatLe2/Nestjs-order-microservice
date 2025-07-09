import { OrderStatus } from "../common/order.enum";
export interface FilterOptions {
    search?: string;
    status?: OrderStatus;
    createdAt?: Date;
}
