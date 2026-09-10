import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(1) name!: string;
  @IsDateString() purchaseDate!: string;
  @IsInt() @Min(1) warrantyMonths!: number;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsString() receiptBase64?: string;
}
