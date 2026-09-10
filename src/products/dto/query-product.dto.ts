import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryProductDto {
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsIn(['vigente', 'por_vencer', 'vencida']) status?:
    'vigente' | 'por_vencer' | 'vencida';
  @IsOptional() @IsString() search?: string;
}
