import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderRepository } from '../models/Order/order.repository';
export declare class OrderProcessor extends WorkerHost {
    private readonly orderRepository;
    constructor(orderRepository: OrderRepository);
    process(job: Job): Promise<void>;
}
