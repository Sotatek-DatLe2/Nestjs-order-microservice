import { VerifyPaymentDto } from './verify-payment.dto';
import { PaymentStatus } from '../../../common/payment-status.enum';
export declare class PaymentService {
    verifyPayment(dto: VerifyPaymentDto): {
        status: PaymentStatus;
        message: string;
    };
}
