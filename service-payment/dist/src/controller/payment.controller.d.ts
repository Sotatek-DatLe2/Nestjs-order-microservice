import { PaymentStatus } from '../kafka/payment-verified-event';
export declare class PaymentService {
    verifyPayment(dto: {
        cvv: string;
        cardNumber: string;
        expirationDate: string;
    }): {
        status: PaymentStatus;
        message: string;
    };
}
