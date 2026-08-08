import { Module } from '@nestjs/common';
import { ContactInfoModuleService } from './contact-info-module.service';
import { ContactInfoModuleController } from './contact-info-module.controller';

@Module({
  controllers: [ContactInfoModuleController],
  providers: [ContactInfoModuleService],
})
export class ContactInfoModuleModule {}
