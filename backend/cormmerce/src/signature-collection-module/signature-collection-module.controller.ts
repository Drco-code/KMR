import { Controller, Get, Param } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { SignatureCollectionModuleService } from './signature-collection-module.service';

@Controller('signature-collection-module')
export class SignatureCollectionModuleController {
  constructor(
    private readonly signatureCollectionModuleService: SignatureCollectionModuleService,
  ) {}

  @AllowAnonymous()
  @Get()
  findAll() {
    return this.signatureCollectionModuleService.findAll();
  }

  @AllowAnonymous()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.signatureCollectionModuleService.findBySlug(slug);
  }
}
