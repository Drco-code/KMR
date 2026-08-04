import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class Cloudinary {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(buffer: Buffer, filename = 'upload') {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'cormmerce/products',
          public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, '')}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(buffer);
    });
  }
}
