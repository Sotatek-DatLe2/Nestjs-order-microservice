import { OrderStatus } from '../../common/order.enum';

export class OrderFSM {
  private state: OrderStatus;
  private readonly transitions: { [key in OrderStatus]?: OrderStatus[] } = {
    [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.DELIVERED]: [],
  };

  constructor(initialState: OrderStatus = OrderStatus.CREATED) {
    this.state = initialState;
  }

  canTransition(to: OrderStatus): boolean {
    return this.transitions[this.state]?.includes(to) ?? false;
  }

  transition(to: OrderStatus): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition from ${this.state} to ${to}`);
    }
    this.state = to;
  }

  getState(): OrderStatus {
    return this.state;
  }
}