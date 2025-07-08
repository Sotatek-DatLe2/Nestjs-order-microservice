import { Expose, Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, IsArray, IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/order.enum';

// OrderHistorySerializer class
export class OrderHistorySerializer {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}

// OrderSerializer class
export class OrderSerializer {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @Expose()
  @Type(() => OrderHistorySerializer)
  @IsArray()
  history: OrderHistorySerializer[];
}