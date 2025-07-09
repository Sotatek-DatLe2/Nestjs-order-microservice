import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { KafkaProducerService } from '../../kafka/producer.service';
import { getQueueToken } from '@nestjs/bullmq';
import { DashboardGateway } from '../../socket/dashboard.gateway';
import { OrderStatus } from '../../common/order.enum';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepository = {
    createEntity: jest.fn(),
    findWithPagination: jest.fn(),
    get: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockKafkaProducerService = {
    emitVerifyPayment: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockDashboardGateway = {
    emitOrderCreated: jest.fn(),
    emitOrderUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: KafkaProducerService, useValue: mockKafkaProducerService },
        { provide: DashboardGateway, useValue: mockDashboardGateway },
        {
          provide: getQueueToken('order-status-delivered'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all orders', async () => {
    const mockOrders = [{ id: 1 }, { id: 2 }];
    mockOrderRepository.findWithPagination.mockResolvedValue([mockOrders, 2]);

    const result = await service.getOrders({ page: 1, limit: 10, filter: {} as any });

    expect(result.data).toEqual(mockOrders);
    expect(result.pagination.total).toBe(2);
    expect(mockOrderRepository.findWithPagination).toHaveBeenCalled();
  });

  it('should return one order by id', async () => {
    const order = { id: 1 };
    mockOrderRepository.get.mockResolvedValue(order);

    const result = await service.getOrder('test-id');
    expect(result).toEqual(order);
    expect(mockOrderRepository.get).toHaveBeenCalledWith('test-id');
  });

  it('should create order and emit Kafka + socket', async () => {
    const dto: any = {
      customerName: 'John',
      paymentDetails: {
        cvv: '123',
        cardNumber: '4111111111111111',
        expirationDate: '12/26',
      },
    };

    const createdOrder = { id: '1234', ...dto };
    mockOrderRepository.createEntity.mockResolvedValue(createdOrder);

    const result = await service.createOrder(dto);

    expect(mockOrderRepository.createEntity).toHaveBeenCalledWith(dto);
    expect(mockKafkaProducerService.emitVerifyPayment).toHaveBeenCalledWith({
      orderId: createdOrder.id,
      paymentDetails: dto.paymentDetails,
    });
    expect(mockDashboardGateway.emitOrderCreated).toHaveBeenCalledWith({
      ...createdOrder,
      status: OrderStatus.CREATED,
      reason: 'Waiting for payment verification...',
    });

    expect(result.status).toBe(OrderStatus.CREATED);
  });
});
