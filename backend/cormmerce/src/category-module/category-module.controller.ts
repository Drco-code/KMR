import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
// @AllowAnonymous() opens a route up to visitors who are NOT logged in.
// Without it, every route in this app requires a staff login by default.
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CategoryModuleService } from './category-module.service';
import { CreateCategoryModuleDto } from './dto/create-category-module.dto';
import { UpdateCategoryModuleDto } from './dto/update-category-module.dto';

@Controller('category-module')
export class CategoryModuleController {
  constructor(private readonly categoryModuleService: CategoryModuleService) {}

  // Only logged-in staff can create a new category.
  @Post()
  create(@Body() createCategoryModuleDto: CreateCategoryModuleDto) {
    return this.categoryModuleService.create(createCategoryModuleDto);
  }

  // Anyone browsing the public catalog can see the list of categories.
  @AllowAnonymous()
  @Get()
  findAll() {
    return this.categoryModuleService.findAll();
  }

  // Anyone can view a single category's details too.
  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryModuleService.findOne(id);
  }

  // Only logged-in staff can edit a category.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryModuleDto: UpdateCategoryModuleDto,
  ) {
    return this.categoryModuleService.update(+id, updateCategoryModuleDto);
  }

  // Only logged-in staff can delete a category.
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryModuleService.remove(+id);
  }
}
