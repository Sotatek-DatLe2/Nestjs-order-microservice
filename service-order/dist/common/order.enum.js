"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATED"] = "created";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["DELIVERED"] = "delivered";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CONFIRMED"] = "CONFIRMED";
    PaymentStatus["DECLINED"] = "DECLINED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=order.enum.js.map