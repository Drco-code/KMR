import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryModuleDto } from './create-category-module.dto';

export class UpdateCategoryModuleDto extends PartialType(
  CreateCategoryModuleDto,
) {}
