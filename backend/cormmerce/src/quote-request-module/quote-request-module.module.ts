import { Module } from '@nestjs/common';
import { QuoteRequestModuleService } from './quote-request-module.service';
import { QuoteRequestModuleController } from './quote-request-module.controller';

@Module({
  controllers: [QuoteRequestModuleController],
  providers: [QuoteRequestModuleService],
})
export class QuoteRequestModuleModule {}
