import { Module } from '@nestjs/common';
import { Cloudinary } from './cloudinary';

@Module({
  providers: [Cloudinary],
  exports: [Cloudinary],
})
export class CloudinaryModule {}
