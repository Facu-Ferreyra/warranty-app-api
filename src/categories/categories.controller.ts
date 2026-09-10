import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Post() create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.userId, dto.name);
  }
  @Get() findAll(@CurrentUser() user: { userId: string }) {
    return this.categoriesService.findAll(user.userId);
  }
  @Get(':id') findOne(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.categoriesService.findOne(user.userId, id);
  }
  @Patch(':id') update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.userId, id, dto.name);
  }
  @Delete(':id') remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(user.userId, id);
  }
}
