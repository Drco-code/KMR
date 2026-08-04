import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandModuleDto } from './create-brand-module.dto';

export class UpdateBrandModuleDto extends PartialType(CreateBrandModuleDto) {}
