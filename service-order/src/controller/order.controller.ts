import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  UseFilters,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';
import { OrderService } from '../models/Order/order.service';
import { CreateOrderDto } from '../models/Order/DTO/create-order.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { FilterOptions } from 'src/util/filter.interface';
import { UpdateOrderStatusDto } from 'src/models/Order/DTO/update-order-status.dto';
import { CustomAuthGuard } from 'src/auth/custom-auth.guard';
import { OrderStatus } from 'src/common/order.enum';

@Controller('orders')
@UseFilters(HttpExceptionFilter)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const filterOptions: FilterOptions = {
      search: search,
      status: status,
      createdAt: startDate ? new Date(startDate) : undefined,
      dateRange:
        startDate && endDate ? { start: new Date(startDate), end: new Date(endDate) } : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };

    return this.orderService.getOrders({
      page: Number(page),
      limit: Number(limit),
      filter: filterOptions,
    });
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrderById(@Param('id') id: string) {
    if (!id) {
      throw new Error('Order ID is required');
    }
    return this.orderService.getOrder(id);
  }

  @UseGuards(CustomAuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateOrder(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: UpdateOrderStatusDto,
  ) {
    if (!id) {
      throw new Error('Order ID is required for update');
    }

    const { status, reason } = body;

    return this.orderService.updateOrderStatus(body, status, reason || 'No reason provided');
  }
}
