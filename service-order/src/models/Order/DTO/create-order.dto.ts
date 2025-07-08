import { IsString, IsNumber, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsNumber()
  totalAmount: number;

  @IsObject()
  paymentDetails: {
    cvv: string;
    cardNumber: string;
    expirationDate: string;
  };
}
