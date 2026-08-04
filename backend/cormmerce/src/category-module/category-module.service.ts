import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { CreateCategoryModuleDto } from './dto/create-category-module.dto';
import { UpdateCategoryModuleDto } from './dto/update-category-module.dto';

@Injectable()
export class CategoryModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

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
      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }

      slug = `${this.slugify(baseSlug)}-${counter++}`;
    }
  }

  async create(createCategoryModuleDto: CreateCategoryModuleDto) {
    const slug = await this.buildUniqueSlug(
      createCategoryModuleDto.slug ?? createCategoryModuleDto.name,
    );

    return this.prisma.category.create({
      data: {
        name: createCategoryModuleDto.name,
        slug,
        parentId: createCategoryModuleDto.parentId,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
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
