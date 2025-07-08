import { OrderStatus } from "src/common/order.enum";
export interface FilterOptions {
    search?: string;
    status?: OrderStatus;
    createdAt?: Date;
}
