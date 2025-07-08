"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const payment_verified_event_1 = require("../kafka/payment-verified-event");
let PaymentService = class PaymentService {
    verifyPayment(dto) {
        const status = dto.cvv === '123' ? payment_verified_event_1.PaymentStatus.CONFIRMED : payment_verified_event_1.PaymentStatus.DECLINED;
        return {
            status,
            message: status === payment_verified_event_1.PaymentStatus.CONFIRMED
                ? 'Payment confirmed successfully.'
                : 'Payment declined. Invalid CVV or card details.',
        };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)()
], PaymentService);
//# sourceMappingURL=payment.controller.js.map