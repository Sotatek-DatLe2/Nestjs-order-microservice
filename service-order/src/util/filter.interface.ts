import { OrderStatus } from "../common/order.enum";

export interface FilterOptions {
  search?: string;
  status?: OrderStatus;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  createdAt?: Date;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}