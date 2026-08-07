import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { CreateQuoteRequestModuleDto } from './dto/create-quote-request-module.dto';
import { UpdateQuoteRequestModuleDto } from './dto/update-quote-request-module.dto';

@Injectable()
export class QuoteRequestModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  async create(createQuoteRequestModuleDto: CreateQuoteRequestModuleDto) {
    const status = createQuoteRequestModuleDto.status ?? 'PENDING';

    return this.prisma.quoteRequest.create({
      data: {
        customerName: createQuoteRequestModuleDto.customerName,
        customerCompany: createQuoteRequestModuleDto.customerCompany,
        customerPhone: createQuoteRequestModuleDto.customerPhone,
        customerLocation: createQuoteRequestModuleDto.customerLocation,
        status,
        items: {
          create: createQuoteRequestModuleDto.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  findAll() {
    return this.prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findOne(id: string) {
    const quoteRequest = await this.prisma.quoteRequest.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quoteRequest) {
      throw new NotFoundException(`Quote request with id ${id} not found`);
    }

    return quoteRequest;
  }

  update(id: number, updateQuoteRequestModuleDto: UpdateQuoteRequestModuleDto) {
    return `This action updates a #${id} quoteRequestModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} quoteRequestModule`;
  }
}
