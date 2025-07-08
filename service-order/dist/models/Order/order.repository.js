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
var OrderRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const order_entity_1 = require("./order.entity");
const orderHistory_entity_1 = require("../OrderHistory/orderHistory.entity");
const order_serializer_1 = require("./order.serializer");
const order_enum_1 = require("../../common/order.enum");
const order_sm_1 = require("./order.sm");
let OrderRepository = OrderRepository_1 = class OrderRepository {
    orderRepository;
    historyRepository;
    dataSource;
    logger = new common_1.Logger(OrderRepository_1.name);
    constructor(orderRepository, historyRepository, dataSource) {
        this.orderRepository = orderRepository;
        this.historyRepository = historyRepository;
        this.dataSource = dataSource;
    }
    async findWithPagination(skip, take, filter) {
        try {
            const whereClause = this.buildWhereClause(filter);
            this.logger.log('Filter options:', filter);
            this.logger.log('Where clause:', whereClause);
            const [orders, total] = await this.orderRepository.findAndCount({
                skip,
                take,
                relations: ['history'],
                order: { createdAt: 'DESC' },
                where: whereClause,
            });
            return [this.transformMany(orders), total];
        }
        catch (error) {
            this.logger.error('❌ Failed to fetch orders with pagination:', error?.message || error);
            throw new common_1.InternalServerErrorException('Failed to fetch paginated orders');
        }
    }
    async get(id, relations = ['history']) {
        const order = await this.orderRepository.findOne({ where: { id }, relations });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found.`);
        }
        return this.transform(order);
    }
    async createEntity(inputs) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = this.orderRepository.create(inputs);
            const savedOrder = await queryRunner.manager.save(order);
            const history = this.historyRepository.create({
                order: savedOrder,
                status: order_enum_1.OrderStatus.CREATED,
            });
            await queryRunner.manager.save(history);
            await queryRunner.commitTransaction();
            return this.transform(savedOrder);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException('Failed to create order');
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateStatus(id, newStatus) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, {
                where: { id },
                relations: ['history'],
            });
            if (!order) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found.`);
            }
            const currentStatus = this.getLatestStatus(order);
            this.validateStatusTransition(currentStatus, newStatus);
            const history = this.historyRepository.create({
                status: newStatus,
                order,
            });
            await queryRunner.manager.save(history);
            await queryRunner.commitTransaction();
            return this.get(id);
        }
        catch (error) {
            console.error('❌ Failed to update status:', error);
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException('Failed to update order status');
        }
        finally {
            await queryRunner.release();
        }
    }
    getLatestStatus(order) {
        if (!order.history || order.history.length === 0) {
            throw new Error('Order has no history entries.');
        }
        return order.history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].status;
    }
    validateStatusTransition(currentStatus, newStatus) {
        const fsm = new order_sm_1.OrderFSM(currentStatus);
        fsm.transition(newStatus);
    }
    transform(model, transformOptions = {}) {
        return (0, class_transformer_1.plainToClass)(order_serializer_1.OrderSerializer, model, transformOptions);
    }
    transformMany(models, transformOptions = {}) {
        return models.map((model) => this.transform(model, transformOptions));
    }
    buildWhereClause(filter) {
        const where = {};
        if (filter?.status) {
            where.status = filter.status;
        }
        if (filter?.createdAt) {
            where.createdAt = filter.createdAt;
        }
        if (filter?.search) {
            where.customerName = (0, typeorm_2.ILike)(`%${filter.search}%`);
        }
        return where;
    }
};
exports.OrderRepository = OrderRepository;
exports.OrderRepository = OrderRepository = OrderRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(orderHistory_entity_1.OrderHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrderRepository);
//# sourceMappingURL=order.repository.js.map