"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const payment_module_1 = require("./models/payment/payment.module");
const microservices_1 = require("@nestjs/microservices");
const consumer_service_1 = require("./kafka/consumer.service");
const producer_service_1 = require("./kafka/producer.service");
const payment_controller_1 = require("./controller/payment.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            payment_module_1.PaymentModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'Kafka',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'payment',
                            brokers: ['localhost:9092'],
                        },
                        consumer: {
                            groupId: 'payment-consumer',
                        },
                    },
                },
            ]),
        ],
        providers: [payment_controller_1.PaymentService, producer_service_1.KafkaProducerService, consumer_service_1.KafkaConsumerService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map