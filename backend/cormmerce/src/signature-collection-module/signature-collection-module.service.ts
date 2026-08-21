import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';

@Injectable()
export class SignatureCollectionModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  findAll() {
    return this.prisma.signatureCollection.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const collection = await this.prisma.signatureCollection.findFirst({
      where: { slug: decodeURIComponent(slug), isActive: true },
    });

    if (!collection) {
      throw new NotFoundException(`Signature collection with slug ${slug} not found`);
    }

    return collection;
  }
}
