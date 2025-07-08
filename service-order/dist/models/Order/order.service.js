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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const order_repository_1 = require("./order.repository");
const order_enum_1 = require("../../common/order.enum");
const rxjs_1 = require("rxjs");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let OrderService = OrderService_1 = class OrderService {
    orderRepository;
    httpService;
    orderStatusQueue;
    logger = new common_1.Logger(OrderService_1.name);
    constructor(orderRepository, httpService, orderStatusQueue) {
        this.orderRepository = orderRepository;
        this.httpService = httpService;
        this.orderStatusQueue = orderStatusQueue;
    }
    async createOrder(dto) {
        const createdOrder = await this.orderRepository.createEntity(dto);
        this.logger.log('Created Order:', createdOrder);
        let paymentStatus;
        let paymentMessage;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://payments-service:3001/api/payment/verify', {
                cvv: dto.paymentDetails.cvv,
                cardNumber: dto.paymentDetails.cardNumber,
                expirationDate: dto.paymentDetails.expirationDate,
            }, {
                headers: { Authorization: 'Bearer 123' },
            }));
            this.logger.log('Payment verification response:', response.data);
            paymentStatus = response.data?.data?.status;
            paymentMessage = response.data?.data?.message;
        }
        catch (err) {
            this.logger.error('Failed to verify payment:', err?.message || err);
            throw new common_1.BadRequestException('Failed to verify payment');
        }
        if (paymentStatus === order_enum_1.PaymentStatus.CONFIRMED) {
            try {
                await this.orderRepository.updateStatus(createdOrder.id, order_enum_1.OrderStatus.CONFIRMED);
            }
            catch (err) {
                this.logger.error(' Failed to update status to CONFIRMED:', err?.message || err);
                throw new common_1.BadRequestException('Failed to update order status to CONFIRMED');
            }
            try {
                await this.orderStatusQueue.add('update-to-delivered', { orderId: createdOrder.id }, { delay: 20000 });
            }
            catch (err) {
                this.logger.error('❌ Failed to schedule DELIVERED job:', err?.message || err);
                throw new common_1.BadRequestException('Failed to schedule order delivery update');
            }
            return {
                ...createdOrder,
                status: order_enum_1.OrderStatus.CONFIRMED,
                reason: paymentMessage,
            };
        }
        try {
            await this.orderRepository.updateStatus(createdOrder.id, order_enum_1.OrderStatus.CANCELLED);
        }
        catch (err) {
            this.logger.error('❌ Failed to update status to CANCELLED:', err?.message || err);
            throw new common_1.BadRequestException('Failed to cancel order');
        }
        return {
            ...createdOrder,
            status: order_enum_1.OrderStatus.CANCELLED,
            reason: paymentMessage,
        };
    }
    async getOrder(id) {
        const order = await this.orderRepository.get(id);
        if (!order) {
            throw new common_1.NotFoundException(`Order with id ${id} not found`);
        }
        return order;
    }
    async updateOrderStatus(dto) {
        if (!dto.id) {
            throw new common_1.BadRequestException('Order ID is required for update');
        }
        const order = await this.orderRepository.get(dto.id);
        if (!order) {
            throw new common_1.NotFoundException(`Order with id ${dto.id} not found`);
        }
        return this.orderRepository.updateStatus(dto.id, dto.status);
    }
    async getOrders({ page = 1, limit = 10, filter, }) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.orderRepository.findWithPagination(skip, limit, filter);
        if (!data || data.length === 0) {
            this.logger.warn('No orders found with the given filter:', filter);
            return {
                data: [],
                pagination: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
            };
        }
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('order-status')),
    __metadata("design:paramtypes", [order_repository_1.OrderRepository,
        axios_1.HttpService,
        bullmq_2.Queue])
], OrderService);
//# sourceMappingURL=order.service.js.map