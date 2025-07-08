import { IsEnum } from "class-validator";
import { PaymentStatus } from "common/payment-status.enum";

export class PaymentSerializer {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
