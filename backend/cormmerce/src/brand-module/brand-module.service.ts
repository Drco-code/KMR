import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { CreateBrandModuleDto } from './dto/create-brand-module.dto';
import { UpdateBrandModuleDto } from './dto/update-brand-module.dto';

@Injectable()
export class BrandModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  create(createBrandModuleDto: CreateBrandModuleDto) {
    return this.prisma.brand.create({
      data: {
        name: createBrandModuleDto.name,
        websiteUrl: createBrandModuleDto.websiteUrl,
        isActive: createBrandModuleDto.isActive ?? true,
        logo: createBrandModuleDto.logo ?? [],
      },
    });
  }

  findAll() {
    return this.prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    return brand;
  }

  update(id: number, updateBrandModuleDto: UpdateBrandModuleDto) {
    return `This action updates a #${id} brandModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} brandModule`;
  }
}
