import { Injectable } from '@nestjs/common';
import { VerifyPaymentDto } from './verify-payment.dto';
import { PaymentStatus } from '../../../common/payment-status.enum';

@Injectable()
export class PaymentService {
  verifyPayment(dto: VerifyPaymentDto) {
    const status =
      dto.cvv === '123' ? PaymentStatus.CONFIRMED : PaymentStatus.DECLINED;

    return {
      status,
      message:
        status === PaymentStatus.CONFIRMED
          ? 'Payment confirmed successfully.'
          : 'Payment declined. Invalid CVV or card details.',
    };
  }
}
