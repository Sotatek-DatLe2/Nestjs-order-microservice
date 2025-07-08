import { OrderStatus } from 'src/common/order.enum';
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    filter: {
        search?: string;
        status?: OrderStatus;
        createdAt?: Date;
    };
}
