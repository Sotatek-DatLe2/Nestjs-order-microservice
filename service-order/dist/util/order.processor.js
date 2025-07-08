"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const order_repository_1 = require("../models/Order/order.repository");
const order_enum_1 = require("../common/order.enum");
let OrderProcessor = class OrderProcessor extends bullmq_1.WorkerHost {
    orderRepository;
    constructor(orderRepository) {
        super();
        this.orderRepository = orderRepository;
    }
    async process(job) {
        const { orderId } = job.data;
        console.log(`[OrderProcessor] Processing job to update order ${orderId} to DELIVERED`);
        await this.orderRepository.updateStatus(orderId, order_enum_1.OrderStatus.DELIVERED);
        console.log(`[OrderProcessor] Successfully updated order ${orderId} to DELIVERED`);
    }
};
exports.OrderProcessor = OrderProcessor;
exports.OrderProcessor = OrderProcessor = __decorate([
    (0, bullmq_1.Processor)('order-status'),
    __metadata("design:paramtypes", [order_repository_1.OrderRepository])
], OrderProcessor);
//# sourceMappingURL=order.processor.js.map