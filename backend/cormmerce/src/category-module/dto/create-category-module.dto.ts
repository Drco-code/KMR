import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  // Parent category's id, for a 2-level nav grouping. Omit for a
  // top-level category (either a pure group header or a standalone
  // browsable category).
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
