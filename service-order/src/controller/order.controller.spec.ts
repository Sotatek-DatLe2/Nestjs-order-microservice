import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../models/Order/order.service';

describe('OrderController', () => {
  let controller: OrderController;
  const mockService = {
    getOrders: jest.fn(),
    getOrder: jest.fn(),
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should return all orders', async () => {
    const orders = [{ id: 1 }, { id: 2 }];
    mockService.getOrders.mockResolvedValue(orders);

    const result = await controller.getOrders();
    expect(result).toEqual(orders);
  });

  it('should return order by id', async () => {
    const order = { id: '839bfe98-3362-4fb8-832a-431bd5838162' };
    mockService.getOrder.mockResolvedValue(order);

    const result = await controller.getOrderById('839bfe98-3362-4fb8-832a-431bd5838162');
    expect(result).toEqual(order);
  });

  it('should create order', async () => {
    const dto = { customerName: 'John' };
    const created = { id: 1, ...dto };
    mockService.createOrder.mockResolvedValue(created);

    const result = await controller.createOrder(dto as any);
    expect(result).toEqual(created);
  });

  it('should update order', async () => {
    const dto = { customerName: 'Jane' };
    const updated = { id: 1, ...dto };
    mockService.updateOrderStatus.mockResolvedValue(updated);

    const result = await controller.updateOrder('1', dto as any);
    expect(result).toEqual(updated);
  });
});
