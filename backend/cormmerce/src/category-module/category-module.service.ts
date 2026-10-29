import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { CreateCategoryModuleDto } from './dto/create-category-module.dto';
import { UpdateCategoryModuleDto } from './dto/update-category-module.dto';
import { slugify } from '../product-module/slug';

@Injectable()
export class CategoryModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  private async buildUniqueSlug(baseSlug: string) {
    const normalizedBaseSlug = slugify(baseSlug);
    if (!normalizedBaseSlug) {
      throw new BadRequestException('Category name or slug must contain letters or numbers');
    }

    let slug = normalizedBaseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }

      slug = `${normalizedBaseSlug}-${counter++}`;
    }
  }

  async create(createCategoryModuleDto: CreateCategoryModuleDto) {
    // Case-insensitive duplicate guard: "Paint" and "paint" are the same
    // category, and the DB unique constraint on name only catches exact
    // matches. Reject duplicates with a clear message instead of creating a
    // near-duplicate row with a suffixed slug.
    const duplicate = await this.prisma.category.findFirst({
      where: { name: { equals: createCategoryModuleDto.name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(
        `A category named "${createCategoryModuleDto.name}" already exists`,
      );
    }

    const slug = await this.buildUniqueSlug(
      createCategoryModuleDto.slug ?? createCategoryModuleDto.name,
    );

    return this.prisma.category.create({
      data: {
        name: createCategoryModuleDto.name,
        slug,
        parentId: createCategoryModuleDto.parentId,
        showInNav: createCategoryModuleDto.showInNav ?? true,
        navOrder: createCategoryModuleDto.navOrder ?? 0,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  update(id: number, updateCategoryModuleDto: UpdateCategoryModuleDto) {
    return `This action updates a #${id} categoryModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryModule`;
  }
}
