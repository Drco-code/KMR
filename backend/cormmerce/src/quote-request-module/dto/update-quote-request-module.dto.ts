import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteRequestModuleDto } from './create-quote-request-module.dto';

export class UpdateQuoteRequestModuleDto extends PartialType(
  CreateQuoteRequestModuleDto,
) {}
