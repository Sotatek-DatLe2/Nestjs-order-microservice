export declare class CreateOrderDto {
    customerName: string;
    totalAmount: number;
    paymentDetails: {
        cvv: string;
        cardNumber: string;
        expirationDate: string;
    };
}
