import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, ValidateNested } from 'class-validator';

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

