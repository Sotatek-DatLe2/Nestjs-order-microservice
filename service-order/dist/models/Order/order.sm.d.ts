import { OrderStatus } from '../../common/order.enum';
export declare class OrderFSM {
    private state;
    private readonly transitions;
    constructor(initialState?: OrderStatus);
    canTransition(to: OrderStatus): boolean;
    transition(to: OrderStatus): void;
    getState(): OrderStatus;
}
