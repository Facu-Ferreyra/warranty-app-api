import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post() create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(user.userId, dto);
  }
  @Get() findAll(
    @CurrentUser() user: { userId: string },
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findAll(user.userId, query);
  }
  @Get(':id') findOne(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(user.userId, id);
  }
  @Patch(':id') update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.userId, id, dto);
  }
  @Delete(':id') remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.productsService.remove(user.userId, id);
  }
}
