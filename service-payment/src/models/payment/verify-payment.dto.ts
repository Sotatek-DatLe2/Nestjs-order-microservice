// verify-payment.dto.ts
import { IsString, IsCreditCard, Matches } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  cvv: string;

  @IsCreditCard()
  cardNumber: string;

  @Matches(/^\d{2}\/\d{2}$/, { message: 'Expiration date must be in MM/YY format' })
  expirationDate: string;
}
