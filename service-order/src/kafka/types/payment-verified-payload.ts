export enum PaymentStatus {
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export interface PaymentDetails {
  cvv?: string;
  cardNumber?: string;
  expirationDate?: string;
}

export interface PaymentVerifiedResponse {
  success: boolean;
  timestamp: string;
  data: {
    status: string;
    message: string;
  };
}
