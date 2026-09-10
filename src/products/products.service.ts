import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { addMonths, differenceInCalendarDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoriesService } from '../categories/categories.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';

type ProductStatus = 'vigente' | 'por_vencer' | 'vencida';
const WARNING_THRESHOLD_DAYS = 30;
const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}
  private assertReceiptSize(receiptBase64?: string) {
    if (!receiptBase64) return;
    if (Buffer.byteLength(receiptBase64, 'base64') > MAX_RECEIPT_BYTES) {
      throw new BadRequestException('El comprobante no puede superar los 4MB');
    }
  }
  private computeStatus(purchaseDate: Date, warrantyMonths: number) {
    const expirationDate = addMonths(purchaseDate, warrantyMonths);
    const daysLeft = differenceInCalendarDays(expirationDate, new Date());
    let status: ProductStatus;
    if (daysLeft < 0) status = 'vencida';
    else if (daysLeft <= WARNING_THRESHOLD_DAYS) status = 'por_vencer';
    else status = 'vigente';
    return { expirationDate, status };
  }
  private async findOwnedOrThrow(userId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
  async create(userId: string, dto: CreateProductDto) {
    await this.categoriesService.findOne(userId, dto.categoryId);
    this.assertReceiptSize(dto.receiptBase64);
    return this.prisma.product.create({
      data: {
        name: dto.name,
        purchaseDate: new Date(dto.purchaseDate),
        warrantyMonths: dto.warrantyMonths,
        categoryId: dto.categoryId,
        receiptBase64: dto.receiptBase64,
        userId,
      },
    });
  }
  async findAll(userId: string, query: QueryProductDto) {
    const products = await this.prisma.product.findMany({
      where: {
        userId,
        categoryId: query.categoryId,
        name: query.search
          ? { contains: query.search, mode: 'insensitive' }
          : undefined,
      },
      include: { category: true },
    });
    const withStatus = products.map((product) => {
      const { expirationDate, status } = this.computeStatus(
        product.purchaseDate,
        product.warrantyMonths,
      );
      const { receiptBase64, ...rest } = product;
      return { ...rest, hasReceipt: !!receiptBase64, expirationDate, status };
    });
    return query.status
      ? withStatus.filter((p) => p.status === query.status)
      : withStatus;
  }
  async findOne(userId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    const { expirationDate, status } = this.computeStatus(
      product.purchaseDate,
      product.warrantyMonths,
    );
    return { ...product, expirationDate, status };
  }
  async update(userId: string, id: string, dto: UpdateProductDto) {
    await this.findOwnedOrThrow(userId, id);
    if (dto.categoryId)
      await this.categoriesService.findOne(userId, dto.categoryId);
    this.assertReceiptSize(dto.receiptBase64);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
      },
    });
  }
  async remove(userId: string, id: string) {
    await this.findOwnedOrThrow(userId, id);
    return this.prisma.product.delete({ where: { id } });
  }
}
