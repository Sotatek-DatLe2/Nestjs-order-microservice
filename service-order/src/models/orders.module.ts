// orders.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './Order/order.entity';
import { OrderHistory } from './OrderHistory/orderHistory.entity';
import { OrderService } from './Order/order.service';
import { OrderController } from '../controller/order.controller';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { OrderProcessor } from 'src/util/order.processor';
import { OrderRepository } from './Order/order.repository';
import { KafkaModule } from '../kafka/kafka.module';
import { DashboardGateway } from 'src/socket/dashboard.gateway';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderHistory]),
    HttpModule,
    BullModule.registerQueue({
      name: 'order-status-delivered',
    }),
    forwardRef(() => KafkaModule),
  ],
  providers: [OrderService, OrderRepository, OrderProcessor, DashboardGateway],
  controllers: [OrderController],
  exports: [OrderRepository, OrderService, DashboardGateway],
})
export class OrdersModule {}
