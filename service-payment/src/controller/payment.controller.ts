// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '../kafka/payment-verified-event';

@Injectable()
export class PaymentService {
  verifyPayment(dto: {
    cvv: string;
    cardNumber: string;
    expirationDate: string;
  }) {
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
