import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

  // Whether this category is eligible to appear in the storefront's
  // dropdown/mega-menu nav. Defaults to true if omitted.
  @IsOptional()
  @IsBoolean()
  showInNav?: boolean;

  // Sibling order within its nav tier, ascending. Defaults to 0 if omitted.
  @IsOptional()
  @IsInt()
  navOrder?: number;
}
