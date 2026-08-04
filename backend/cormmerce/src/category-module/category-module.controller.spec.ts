import { Test, TestingModule } from '@nestjs/testing';
import { CategoryModuleController } from './category-module.controller';
import { CategoryModuleService } from './category-module.service';

describe('CategoryModuleController', () => {
  let controller: CategoryModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryModuleController],
      providers: [CategoryModuleService],
    }).compile();

    controller = module.get<CategoryModuleController>(CategoryModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
