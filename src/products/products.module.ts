import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';

@Module({
  imports: [CategoriesModule],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
