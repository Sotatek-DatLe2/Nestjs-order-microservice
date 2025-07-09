import { IsString, IsNumber, IsEnum } from 'class-validator';
import { OrderStatus } from '../../../common/order.enum';

export class UpdateOrderStatusDto {
  @IsString()
  id: string;

  @IsString()
  reason: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
