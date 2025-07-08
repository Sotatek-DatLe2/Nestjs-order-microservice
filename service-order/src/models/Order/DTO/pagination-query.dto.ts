import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from 'src/common/order.enum';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterOptionsDto)
  filter?: FilterOptionsDto;
}

export class FilterOptionsDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  createdAt?: string;
}

