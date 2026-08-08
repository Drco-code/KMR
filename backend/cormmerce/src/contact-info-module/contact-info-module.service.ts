import { Injectable } from '@nestjs/common';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';

@Injectable()
export class ContactInfoModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  // The storefront footer renders one location block (address + mini map)
  // from this singleton row — staff edit it in the AdminJS dashboard and
  // changes go live on the next page load.
  //
  // NOTE: never return a bare `null` from this controller — NestJS
  // serializes `null` as a 200 with an EMPTY body (not "null"), which
  // crashes the storefront's res.json() with "Unexpected end of JSON input"
  // and takes down every page. Always return a JSON object instead.
  async findActive(): Promise<{ address: string | null; mapEmbedUrl: string | null }> {
    const info = await this.prisma.contactInfo.findFirst();

    if (!info) {
      return { address: null, mapEmbedUrl: null };
    }

    // Only hand through http(s) map URLs. This is admin-entered data
    // flowing straight into an iframe src, so we never forward anything
    // that could be a script (e.g. "javascript:").
    const mapEmbedUrl = info.mapEmbedUrl?.match(/^https?:\/\//i)
      ? info.mapEmbedUrl
      : null;

    return {
      address: info.address?.trim() || null,
      mapEmbedUrl,
    };
  }
}
