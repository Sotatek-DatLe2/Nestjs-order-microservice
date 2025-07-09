import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { KafkaProducerService } from '../src/kafka/producer.service';
import { KafkaConsumerService } from '../src/kafka/consumer.service';
import { DashboardGateway } from '../src/socket/dashboard.gateway';
import { Queue } from 'bullmq';
import { OrderStatus } from '../src/common/order.enum';
import { CustomAuthGuard } from '../src/auth/custom-auth.guard';

// Mock UUID for consistent testing
const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let kafkaProducerMock: jest.Mocked<KafkaProducerService>;
  let kafkaConsumerMock: jest.Mocked<KafkaConsumerService>;
  let dashboardGatewayMock: jest.Mocked<DashboardGateway>;
  let orderStatusQueueMock: jest.Mocked<Queue>;

  beforeAll(async () => {
    kafkaProducerMock = {
      emitVerifyPayment: jest.fn().mockResolvedValue({}),
    } as any;

    kafkaConsumerMock = {
      onModuleInit: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockResolvedValue(undefined),
    } as any;

    dashboardGatewayMock = {
      emitOrderCreated: jest.fn(),
      emitOrderUpdated: jest.fn(),
    } as any;

    orderStatusQueueMock = {
      add: jest.fn().mockResolvedValue({}),
    } as any;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KafkaProducerService)
      .useValue(kafkaProducerMock)
      .overrideProvider(KafkaConsumerService)
      .useValue(kafkaConsumerMock)
      .overrideProvider(DashboardGateway)
      .useValue(dashboardGatewayMock)
      .overrideProvider('order-status-delivered')
      .useValue(orderStatusQueueMock)
      .overrideGuard(CustomAuthGuard)
      .useValue({ canActivate: () => true }) // Mock auth guard to always allow access
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create an order successfully and emit events', async () => {
      const createOrderDto = {
        customerName: 'Le Tien Dat',
        totalAmount: 100,
        paymentDetails: {
          cvv: '123',
          cardNumber: '4111111111111111',
          expirationDate: '12/25',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe(OrderStatus.CREATED);
      expect(response.body.customerName).toBe(createOrderDto.customerName);
      expect(response.body.totalAmount).toBe(createOrderDto.totalAmount);
      expect(response.body.reason).toBe('Waiting for payment verification...');

      expect(kafkaProducerMock.emitVerifyPayment).toHaveBeenCalledWith({
        orderId: response.body.id,
        paymentDetails: createOrderDto.paymentDetails,
      });

      expect(dashboardGatewayMock.emitOrderCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: response.body.id,
          customerName: createOrderDto.customerName,
          totalAmount: createOrderDto.totalAmount,
          status: OrderStatus.CREATED,
          reason: 'Waiting for payment verification...',
        }),
      );

      // rollback the order creation for cleanup
      await request(app.getHttpServer()).delete(`/orders/${response.body.id}`);
    });

    it('should fail to create an order with invalid data', async () => {
      const invalidOrderDto = {
        customerName: '',
        totalAmount: -100,
        paymentDetails: {
          cvv: '12',
          cardNumber: '411111',
          expirationDate: '12/25',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(invalidOrderDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /orders', () => {
    it('should retrieve orders with default pagination', async () => {
      const response = await request(app.getHttpServer()).get('/orders').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should retrieve orders with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({
          page: 2,
          limit: 5,
          status: OrderStatus.CREATED,
          search: 'Le Tien Dat',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          sortBy: 'totalAmount',
          sortOrder: 'ASC',
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should return empty data for no matching orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({
          search: 'NonExistentCustomer',
          status: OrderStatus.DELIVERED,
          startDate: '2025-01-01',
          endDate: '2025-01-02',
        })
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.totalPages).toBe(0);
    });
  });

  describe('GET /orders/:id', () => {
    it('should retrieve an order by ID', async () => {
      const RealID = '0bcd25b6-9185-42d0-bbdb-00d3dfd7c816';
      const response = await request(app.getHttpServer()).get(`/orders/${RealID}`).expect(200);

      expect(response.body).toHaveProperty('id', RealID);
      expect(response.body).toHaveProperty('status', OrderStatus.DELIVERED);
      expect(response.body).toHaveProperty('history');
    });

    it('should return 404 for non-existent order ID', async () => {
      const response = await request(app.getHttpServer()).get(`/orders/${mockUuid}`).expect(404);

      expect(response.body.message).toContain(`Order with ID ${mockUuid} not found`);
    });
  });

  describe('PUT /orders/:id', () => {
    it('should fail to update to invalid status transition', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', 'Bearer 123')
        .send({
          customerName: 'Le Tien Dat',
          totalAmount: 100,
          paymentDetails: {
            cvv: '143',
            cardNumber: '4111111111111111',
            expirationDate: '12/25',
          },
        });

      const orderId = createResponse.body.id;

      const invalidUpdateDto = {
        status: OrderStatus.DELIVERED, // Invalid: cannot transition from CREATED to DELIVERED
        reason: 'Invalid transition attempt',
        id: orderId,
      };

      const response = await request(app.getHttpServer())
        .put(`/orders/${orderId}`)
        .send(invalidUpdateDto)
        .expect(500); // InternalServerErrorException from FSM validation

      expect(response.body.message).toContain('Failed to update order status');
    });

    it('should return 404 for non-existent order ID', async () => {
      const updateOrderDto = {
        status: OrderStatus.CONFIRMED,
        reason: 'Order confirmed',
        id: mockUuid,
      };

      const response = await request(app.getHttpServer())
        .put(`/orders/${mockUuid}`)
        .set('Authorization', 'Bearer 123')
        .send(updateOrderDto)
        .expect(404);

      expect(response.body.message).toContain(`Order with ID ${mockUuid} not found.`);
    });
  });
});
