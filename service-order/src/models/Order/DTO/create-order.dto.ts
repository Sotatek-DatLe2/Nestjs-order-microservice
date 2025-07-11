import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsObject,
  IsPositive,
  IsNotEmpty,
  ValidateNested,
  Length,
  Matches,
} from 'class-validator';

export class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  cvv: string;

  @IsString()
  @IsNotEmpty()
  @Length(16, 16, { message: 'Card number must be exactly 16 digits' })
  @Matches(/^\d+$/, { message: 'Card number must contain only digits' })
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
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'totalAmount must be a number' },
  )
  @IsPositive({ message: 'totalAmount must be greater than 0' })
  totalAmount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;
}
