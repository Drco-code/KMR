import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priceDescription?: string;

  // Pre-hosted Cloudinary URLs, in display order (images[0] is the cover
  // image). Combined with any uploaded files — see ProductModuleService.create.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Shows this product in the homepage "Signature Collections" section.
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Admin-only inventory count — never exposed by the public catalog
  // endpoints (see ProductModuleService.findAll/findOne).
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsUUID()
  categoryId: string;
}
