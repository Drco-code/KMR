import { Module } from '@nestjs/common';
import { AdminModuleService } from './admin-module.service';

@Module({
  providers: [AdminModuleService],
  exports: [AdminModuleService],
})
export class AdminModuleModule {}
