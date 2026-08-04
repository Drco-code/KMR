import { Injectable, NotFoundException } from '@nestjs/common';
import { Cloudinary } from '../cloudinary/cloudinary';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { CreateProductModuleDto } from './dto/create-product-module.dto';
import { UpdateProductModuleDto } from './dto/update-product-module.dto';

@Injectable()
export class ProductModuleService {
  constructor(
    private readonly prisma: PrismaModuleService,
    private readonly cloudinary: Cloudinary,
  ) {}

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async buildUniqueSlug(baseSlug: string) {
    let slug = this.slugify(baseSlug);
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }

      slug = `${this.slugify(baseSlug)}-${counter++}`;
    }
  }

  async create(
    createProductModuleDto: CreateProductModuleDto,
    files?: Express.Multer.File[],
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductModuleDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id ${createProductModuleDto.categoryId} not found`,
      );
    }

    const providedImages = createProductModuleDto.images ?? [];
    if (!files?.length && providedImages.length === 0) {
      throw new NotFoundException(
        'At least one uploaded image file or image URL must be provided',
      );
    }

    const uploadedUrls = files?.length
      ? await Promise.all(
          files.map((f) => this.cloudinary.upload(f.buffer, f.originalname)),
        )
      : [];
    const images = [...providedImages, ...uploadedUrls];

    // Index-aligned with `images` (see schema comment on Product.imagesMimeType)
    // — pasted URLs have no known metadata, so they get blank placeholders.
    const imagesMimeType = [
      ...providedImages.map(() => ''),
      ...(files ?? []).map((f) => f.mimetype),
    ];
    const imagesFilename = [
      ...providedImages.map(() => ''),
      ...(files ?? []).map((f) => f.originalname),
    ];
    const imagesSize = [
      ...providedImages.map(() => 0),
      ...(files ?? []).map((f) => f.size),
    ];

    const slug = await this.buildUniqueSlug(
      createProductModuleDto.slug ?? createProductModuleDto.name,
    );

    return this.prisma.product.create({
      data: {
        name: createProductModuleDto.name,
        slug,
        description: createProductModuleDto.description,
        priceDescription: createProductModuleDto.priceDescription,
        images,
        imagesMimeType,
        imagesFilename,
        imagesSize,
        isActive: createProductModuleDto.isActive ?? true,
        isFeatured: createProductModuleDto.isFeatured ?? false,
        stock: createProductModuleDto.stock ?? 0,
        categoryId: createProductModuleDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  // Public catalog reads — `stock` is an internal inventory count, staff-only
  // (visible/editable through the AdminJS dashboard, which reads straight
  // from Prisma and isn't affected by this omit). Never let it leak into
  // what anonymous customers can fetch.
  findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
      omit: { stock: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
      omit: { stock: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  update(id: number, updateProductModuleDto: UpdateProductModuleDto) {
    return `This action updates a #${id} productModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} productModule`;
  }
}
