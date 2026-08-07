import { Module } from '@nestjs/common';
import { PromoModuleService } from './promo-module.service';
import { PromoModuleController } from './promo-module.controller';

@Module({
  controllers: [PromoModuleController],
  providers: [PromoModuleService],
})
export class PromoModuleModule {}
