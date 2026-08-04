import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductModuleService } from './product-module.service';
import { ProductModuleController } from './product-module.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProductModuleController],
  providers: [ProductModuleService],
})
export class ProductModuleModule {}
