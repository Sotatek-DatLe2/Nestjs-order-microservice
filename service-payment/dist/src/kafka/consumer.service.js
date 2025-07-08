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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const kafka_topics_1 = require("./kafka-topics");
const payment_service_1 = require("../models/payment/payment.service");
const producer_service_1 = require("./producer.service");
let KafkaConsumerService = class KafkaConsumerService {
    paymentService;
    kafkaProducer;
    constructor(paymentService, kafkaProducer) {
        this.paymentService = paymentService;
        this.kafkaProducer = kafkaProducer;
    }
    async handleVerifyPayment(payload) {
        const { orderId, paymentDetails } = payload;
        const result = this.paymentService.verifyPayment(paymentDetails);
        const response = {
            orderId,
            status: result.status,
            message: result.message,
        };
        await this.kafkaProducer.emitPaymentVerified(response);
    }
};
exports.KafkaConsumerService = KafkaConsumerService;
__decorate([
    (0, microservices_1.EventPattern)(kafka_topics_1.KafkaTopics.ORDER_PAYMENT_VERIFY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KafkaConsumerService.prototype, "handleVerifyPayment", null);
exports.KafkaConsumerService = KafkaConsumerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        producer_service_1.KafkaProducerService])
], KafkaConsumerService);
//# sourceMappingURL=consumer.service.js.map