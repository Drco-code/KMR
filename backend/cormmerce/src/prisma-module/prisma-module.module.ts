// src/prisma/prisma.module.ts
import { PrismaModuleService } from './prisma-module.service';
import { Global, Module } from '@nestjs/common';

@Global() // makes PrismaModuleService injectable everywhere without re-importing PrismaModule each time
@Module({
  providers: [PrismaModuleService],
  exports: [PrismaModuleService],
})
export class PrismaModule {}
