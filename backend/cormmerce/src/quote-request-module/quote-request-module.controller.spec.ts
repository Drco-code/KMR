import { Test, TestingModule } from '@nestjs/testing';
import { QuoteRequestModuleController } from './quote-request-module.controller';
import { QuoteRequestModuleService } from './quote-request-module.service';

describe('QuoteRequestModuleController', () => {
  let controller: QuoteRequestModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteRequestModuleController],
      providers: [QuoteRequestModuleService],
    }).compile();

    controller = module.get<QuoteRequestModuleController>(
      QuoteRequestModuleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
