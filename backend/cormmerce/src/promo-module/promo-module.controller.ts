import { Controller, Get } from '@nestjs/common';
// @AllowAnonymous() opens a route up to visitors who are NOT logged in.
// Without it, every route in this app requires a staff login by default.
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { PromoModuleService } from './promo-module.service';

@Controller('promo-module')
export class PromoModuleController {
  constructor(private readonly promoModuleService: PromoModuleService) {}

  // Anyone browsing the storefront can read the current promo banner —
  // this is what the header bar renders from.
  @AllowAnonymous()
  @Get()
  findActive() {
    return this.promoModuleService.findActive();
  }
}
