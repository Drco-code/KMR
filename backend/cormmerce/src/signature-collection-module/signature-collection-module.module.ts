import { Module } from '@nestjs/common';
import { SignatureCollectionModuleService } from './signature-collection-module.service';
import { SignatureCollectionModuleController } from './signature-collection-module.controller';
import { PrismaModule } from '../prisma-module/prisma-module.module';

@Module({
  imports: [PrismaModule],
  providers: [SignatureCollectionModuleService],
  controllers: [SignatureCollectionModuleController],
})
export class SignatureCollectionModule {}
