import { Controller, Get } from '@nestjs/common';
// Without @AllowAnonymous(), Better Auth's global guard (see app.module.ts)
// requires a staff login for every route — including this one, which
// external uptime monitors (UptimeRobot etc.) hit with no session at all.
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AllowAnonymous()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @AllowAnonymous()
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
