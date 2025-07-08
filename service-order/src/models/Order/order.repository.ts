import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial, ILike, Between } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Order } from './order.entity';
import { OrderHistory } from '../OrderHistory/orderHistory.entity';
import { OrderSerializer } from './order.serializer';
import { OrderStatus } from '../../common/order.enum';
import { OrderFSM } from './order.sm';
import { FilterOptions } from 'src/util/filter.interface';

@Injectable()
export class OrderRepository {
  private readonly logger = new Logger(OrderRepository.name);
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderHistory)
    private readonly historyRepository: Repository<OrderHistory>,

    private readonly dataSource: DataSource,
  ) {}

  async findWithPagination(
    skip: number,
    take: number,
    filter: FilterOptions,
  ): Promise<[OrderSerializer[], number]> {
    try {
      const whereClause = this.buildWhereClause(filter);

      this.logger.log('Filter options:', filter);
      this.logger.log('Where clause:', whereClause);

      const orderField = filter.sortBy ?? 'createdAt';
      const orderDirection: 'ASC' | 'DESC' = filter.sortOrder ?? 'DESC';

      const [orders, total] = await this.orderRepository.findAndCount({
        skip,
        take,
        relations: ['history'],
        where: whereClause,
        order: {
          [orderField]: orderDirection,
        },
      });

      return [this.transformMany(orders), total];
    } catch (error) {
      this.logger.error('Failed to fetch orders with pagination:', error?.message || error);
      throw new InternalServerErrorException('Failed to fetch paginated orders');
    }
  }

  async get(id: string, relations: string[] = ['history']): Promise<OrderSerializer> {
    const order = await this.orderRepository.findOne({ where: { id }, relations });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return this.transform(order);
  }

  async createEntity(inputs: DeepPartial<Order>): Promise<OrderSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.orderRepository.create(inputs);
      const savedOrder = await queryRunner.manager.save(order);

      const history = this.historyRepository.create({
        order: savedOrder,
        status: OrderStatus.CREATED,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return this.transform(savedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create order');
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, newStatus: OrderStatus): Promise<OrderSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['history'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      const currentStatus = this.getLatestStatus(order);
      this.validateStatusTransition(currentStatus, newStatus);

      order.status = newStatus;
      await queryRunner.manager.save(Order, order);

      const history = queryRunner.manager.create(OrderHistory, {
        status: newStatus,
        order,
      });

      await queryRunner.manager.save(OrderHistory, history);

      await queryRunner.commitTransaction();

      return this.get(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to update status:', error);
      throw new InternalServerErrorException('Failed to update order status');
    } finally {
      await queryRunner.release();
    }
  }

  private getLatestStatus(order: Order): OrderStatus {
    if (!order.history || order.history.length === 0) {
      throw new Error('Order has no history entries.');
    }

    return order.history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].status;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const fsm = new OrderFSM(currentStatus);
    fsm.transition(newStatus);
  }

  private transform(model: Order, transformOptions: any = {}): OrderSerializer {
    return plainToClass(OrderSerializer, model, transformOptions);
  }

  private transformMany(models: Order[], transformOptions: any = {}): OrderSerializer[] {
    return models.map((model) => this.transform(model, transformOptions));
  }

  private buildWhereClause(filter: FilterOptions): any {
    const where: any = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.dateRange) {
      where.createdAt = Between(filter.dateRange.start, filter.dateRange.end);
    }

    if (filter?.search) {
      where.customerName = ILike(`%${filter.search}%`);
    }

    return where;
  }
}
