import { Module } from '@nestjs/common';
import { CategoryModuleService } from './category-module.service';
import { CategoryModuleController } from './category-module.controller';

@Module({
  controllers: [CategoryModuleController],
  providers: [CategoryModuleService],
})
export class CategoryModuleModule {}
