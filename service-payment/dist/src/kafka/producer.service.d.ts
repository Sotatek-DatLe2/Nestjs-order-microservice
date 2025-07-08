import { ClientKafka } from '@nestjs/microservices';
import { PaymentVerifiedEvent } from './payment-verified-event';
export declare class KafkaProducerService {
    private readonly kafkaClient;
    constructor(kafkaClient: ClientKafka);
    emitPaymentVerified(payload: PaymentVerifiedEvent): void;
}
