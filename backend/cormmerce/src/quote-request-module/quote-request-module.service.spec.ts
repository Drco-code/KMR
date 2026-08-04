import { Test, TestingModule } from '@nestjs/testing';
import { QuoteRequestModuleService } from './quote-request-module.service';

describe('QuoteRequestModuleService', () => {
  let service: QuoteRequestModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteRequestModuleService],
    }).compile();

    service = module.get<QuoteRequestModuleService>(QuoteRequestModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
