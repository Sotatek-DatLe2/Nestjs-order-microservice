import { PaymentService } from '../models/payment/payment.service';
import { KafkaProducerService } from './producer.service';
export declare class KafkaConsumerService {
    private readonly paymentService;
    private readonly kafkaProducer;
    constructor(paymentService: PaymentService, kafkaProducer: KafkaProducerService);
    handleVerifyPayment(payload: any): Promise<void>;
}
