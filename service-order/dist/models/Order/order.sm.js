"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderFSM = void 0;
const order_enum_1 = require("../../common/order.enum");
class OrderFSM {
    state;
    transitions = {
        [order_enum_1.OrderStatus.CREATED]: [order_enum_1.OrderStatus.CONFIRMED, order_enum_1.OrderStatus.CANCELLED],
        [order_enum_1.OrderStatus.CONFIRMED]: [order_enum_1.OrderStatus.DELIVERED, order_enum_1.OrderStatus.CANCELLED],
        [order_enum_1.OrderStatus.CANCELLED]: [],
        [order_enum_1.OrderStatus.DELIVERED]: [],
    };
    constructor(initialState = order_enum_1.OrderStatus.CREATED) {
        this.state = initialState;
    }
    canTransition(to) {
        return this.transitions[this.state]?.includes(to) ?? false;
    }
    transition(to) {
        if (!this.canTransition(to)) {
            throw new Error(`Invalid transition from ${this.state} to ${to}`);
        }
        this.state = to;
    }
    getState() {
        return this.state;
    }
}
exports.OrderFSM = OrderFSM;
//# sourceMappingURL=order.sm.js.map