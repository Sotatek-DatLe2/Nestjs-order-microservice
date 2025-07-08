
export enum PaymentStatus {
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export interface PaymentVerifiedEvent {
  orderId: string;
  status: PaymentStatus;
  message: string;
}

export interface KafkaResponse<T> {
  success: boolean;
  timestamp: string;
  data: T;
}