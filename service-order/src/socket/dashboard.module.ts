import { Module } from '@nestjs/common';
import { DashboardGateway } from './dashboard.gateway';
import { OrdersModule } from '../models/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [DashboardGateway],
  exports: [DashboardGateway],
})
export class DashboardModule {}