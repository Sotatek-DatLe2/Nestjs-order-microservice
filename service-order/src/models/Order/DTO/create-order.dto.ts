import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsObject,
  IsPositive,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  cvv: string;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  expirationDate: string;
}
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  totalAmount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;
}

