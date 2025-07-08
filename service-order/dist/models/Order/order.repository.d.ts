import { Repository, DataSource, DeepPartial } from 'typeorm';
import { Order } from './order.entity';
import { OrderHistory } from '../OrderHistory/orderHistory.entity';
import { OrderSerializer } from './order.serializer';
import { OrderStatus } from '../../common/order.enum';
import { FilterOptions } from 'src/util/filter.interface';
export declare class OrderRepository {
    private readonly orderRepository;
    private readonly historyRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, historyRepository: Repository<OrderHistory>, dataSource: DataSource);
    findWithPagination(skip: number, take: number, filter: FilterOptions): Promise<[OrderSerializer[], number]>;
    get(id: string, relations?: string[]): Promise<OrderSerializer>;
    createEntity(inputs: DeepPartial<Order>): Promise<OrderSerializer>;
    updateStatus(id: string, newStatus: OrderStatus): Promise<OrderSerializer>;
    private getLatestStatus;
    private validateStatusTransition;
    private transform;
    private transformMany;
    private buildWhereClause;
}
