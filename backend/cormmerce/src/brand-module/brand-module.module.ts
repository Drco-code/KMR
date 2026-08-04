import { Module } from '@nestjs/common';
import { BrandModuleService } from './brand-module.service';
import { BrandModuleController } from './brand-module.controller';

@Module({
  controllers: [BrandModuleController],
  providers: [BrandModuleService],
})
export class BrandModuleModule {}
