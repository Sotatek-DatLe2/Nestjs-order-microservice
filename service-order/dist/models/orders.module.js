"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_service_1 = require("./Order/order.service");
const order_controller_1 = require("../controller/order.controller");
const order_repository_1 = require("./Order/order.repository");
const order_entity_1 = require("./Order/order.entity");
const orderHistory_entity_1 = require("./OrderHistory/orderHistory.entity");
const axios_1 = require("@nestjs/axios");
const bullmq_1 = require("@nestjs/bullmq");
const order_processor_1 = require("../util/order.processor");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, orderHistory_entity_1.OrderHistory]),
            axios_1.HttpModule,
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
                },
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'order-status',
            }),
        ],
        providers: [order_service_1.OrderService, order_repository_1.OrderRepository, order_processor_1.OrderProcessor],
        controllers: [order_controller_1.OrderController],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map