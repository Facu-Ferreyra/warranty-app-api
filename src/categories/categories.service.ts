import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, name: string) {
    try {
      return await this.prisma.category.create({ data: { name, userId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya tenés una categoría con ese nombre');
      }
      throw error;
    }
  }
  findAll(userId: string) {
    return this.prisma.category.findMany({ where: { userId } });
  }
  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }
  async update(userId: string, id: string, name: string) {
    await this.findOne(userId, id);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya tenés una categoría con ese nombre');
      }
      throw error;
    }
  }
  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No podés borrar una categoría que tiene productos asociados',
        );
      }
      throw error;
    }
  }
}
