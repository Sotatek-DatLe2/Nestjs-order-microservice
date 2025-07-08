export declare enum PaymentStatus {
    CONFIRMED = "CONFIRMED",
    DECLINED = "DECLINED"
}
export interface PaymentVerifiedEvent {
    orderId: string;
    status: PaymentStatus;
    message: string;
}
