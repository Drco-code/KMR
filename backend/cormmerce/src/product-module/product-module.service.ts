import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cloudinary } from '../cloudinary/cloudinary';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { CreateProductModuleDto } from './dto/create-product-module.dto';
import { UpdateProductModuleDto } from './dto/update-product-module.dto';
import { slugify } from './slug';
import { normalizeYouTubeUrl } from './youtube';

@Injectable()
export class ProductModuleService {
  constructor(
    private readonly prisma: PrismaModuleService,
    private readonly cloudinary: Cloudinary,
  ) {}

  private async buildUniqueSlug(baseSlug: string) {
    let slug = slugify(baseSlug);
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }

      slug = `${slugify(baseSlug)}-${counter++}`;
    }
  }

  async create(
    createProductModuleDto: CreateProductModuleDto,
    files?: Express.Multer.File[],
  ) {
    const { categoryIds, primaryCategoryId } = createProductModuleDto;

    if (!categoryIds.includes(primaryCategoryId)) {
      throw new BadRequestException(
        'primaryCategoryId must be one of categoryIds',
      );
    }

    const foundCategories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (foundCategories.length !== categoryIds.length) {
      throw new NotFoundException('One or more categoryIds do not exist');
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
    const youtubeUrls = (createProductModuleDto.youtubeUrls ?? []).map(normalizeYouTubeUrl);

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

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: createProductModuleDto.name,
          slug,
          description: createProductModuleDto.description,
          priceDescription: createProductModuleDto.priceDescription,
          images,
          youtubeUrls,
          imagesMimeType,
          imagesFilename,
          imagesSize,
          isActive: createProductModuleDto.isActive ?? true,
          isFeatured: createProductModuleDto.isFeatured ?? false,
          stock: createProductModuleDto.stock ?? 0,
        },
      });

      await tx.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
          isPrimary: categoryId === primaryCategoryId,
        })),
      });

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: { categories: { include: { category: true } } },
      });
    });
  }

  // Public catalog reads — `stock` is an internal inventory count, staff-only
  // (visible/editable through the AdminJS dashboard, which reads straight
  // from Prisma and isn't affected by this omit). Never let it leak into
  // what anonymous customers can fetch.
  async findAll() {
    const [products, quantities] = await Promise.all([
      this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { categories: { include: { category: true } } },
        omit: { stock: true },
      }),
      // "Best Selling" sort proxy — matched by name, same tradeoff as the
      // AdminJS dashboard's demand tracking (see QuoteRequestItem.productName
      // comment): we don't have real sales data, only what's been requested.
      this.prisma.quoteRequestItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true },
      }),
    ]);

    const quantityByName = new Map(
      quantities.map((q) => [q.productName, q._sum.quantity ?? 0]),
    );

    return products.map(({ categories, ...product }) => ({
      ...product,
      categories: categories.map((pc) => ({
        id: pc.category.id,
        slug: pc.category.slug,
        name: pc.category.name,
        isPrimary: pc.isPrimary,
      })),
      totalQuantityRequested: quantityByName.get(product.name) ?? 0,
    }));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
      omit: { stock: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const { categories, ...rest } = product;
    return {
      ...rest,
      categories: categories.map((pc) => ({
        id: pc.category.id,
        slug: pc.category.slug,
        name: pc.category.name,
        isPrimary: pc.isPrimary,
      })),
    };
  }

  update(id: number, updateProductModuleDto: UpdateProductModuleDto) {
    return `This action updates a #${id} productModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} productModule`;
  }
}
