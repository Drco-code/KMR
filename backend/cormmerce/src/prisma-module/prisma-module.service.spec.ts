import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModuleService } from './prisma-module.service';

describe('PrismaModuleService', () => {
  let service: PrismaModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaModuleService],
    }).compile();

    service = module.get<PrismaModuleService>(PrismaModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
