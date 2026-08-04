import { Test, TestingModule } from '@nestjs/testing';
import { CategoryModuleService } from './category-module.service';

describe('CategoryModuleService', () => {
  let service: CategoryModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryModuleService],
    }).compile();

    service = module.get<CategoryModuleService>(CategoryModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
