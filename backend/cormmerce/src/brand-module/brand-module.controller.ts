import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { BrandModuleService } from './brand-module.service';
import { CreateBrandModuleDto } from './dto/create-brand-module.dto';
import { UpdateBrandModuleDto } from './dto/update-brand-module.dto';

@Controller('brand-module')
export class BrandModuleController {
  constructor(private readonly brandModuleService: BrandModuleService) {}

  // Only logged-in staff can create a new brand.
  @Post()
  create(@Body() createBrandModuleDto: CreateBrandModuleDto) {
    return this.brandModuleService.create(createBrandModuleDto);
  }

  // Anyone browsing the storefront can see the list of brands.
  @AllowAnonymous()
  @Get()
  findAll() {
    return this.brandModuleService.findAll();
  }

  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandModuleService.findOne(id);
  }

  // Only logged-in staff can edit a brand.
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandModuleDto: UpdateBrandModuleDto) {
    return this.brandModuleService.update(+id, updateBrandModuleDto);
  }

  // Only logged-in staff can delete a brand.
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandModuleService.remove(+id);
  }
}
