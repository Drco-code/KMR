import { Injectable } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';

@Injectable()
export class PromoModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  // The storefront header renders a single promo bar. Returns the banner
  // (message + optional link) only while one is actually running — hidden
  // when the row is missing, isActive is false, or the message is blank.
  async findActive(): Promise<{ message: string; link: string | null } | null> {
    const banner = await this.prisma.promoBanner.findFirst();

    if (!banner) return null;
    if (!banner.isActive || !banner.message?.trim()) return null;

    // Only hand through safe link values (relative paths or http(s)). This
    // is admin-entered data flowing straight into a next/link href, so we
    // never forward anything that could be a script (e.g. "javascript:").
    const link = banner.link?.match(/^(\/|[a-z]+:\/\/)/i)
      ? banner.link
      : null;

    return { message: banner.message.trim(), link };
  }
}
