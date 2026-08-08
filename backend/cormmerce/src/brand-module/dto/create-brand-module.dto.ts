import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBrandModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  // One-line tagline shown under the brand name in the homepage "Our
  // Brands" section.
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Pre-hosted logo URL(s), for API consumers that don't go through the
  // AdminJS upload widget. AdminJS's own upload feature writes here too
  // (see AdminModuleService), bypassing this DTO entirely.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  logo?: string[];
}
