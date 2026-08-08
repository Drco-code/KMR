import { Controller, Get } from '@nestjs/common';
// @AllowAnonymous() opens a route up to visitors who are NOT logged in.
// Without it, every route in this app requires a staff login by default.
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ContactInfoModuleService } from './contact-info-module.service';

@Controller('contact-info-module')
export class ContactInfoModuleController {
  constructor(private readonly contactInfoModuleService: ContactInfoModuleService) {}

  // Anyone browsing the storefront can read the contact/location info — this
  // is what the footer's "Visit Us" block renders from.
  @AllowAnonymous()
  @Get()
  findActive() {
    return this.contactInfoModuleService.findActive();
  }
}
