import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

// @AllowAnonymous() opens a route up to visitors who are NOT logged in.
// Without it, every route in this app requires a staff login by default.
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ProductModuleService } from './product-module.service';
import { CreateProductModuleDto } from './dto/create-product-module.dto';
import { UpdateProductModuleDto } from './dto/update-product-module.dto';

@Controller('product-module')
export class ProductModuleController {
  constructor(private readonly productModuleService: ProductModuleService) {}

  // Only logged-in staff can add a new product.
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @Body() createProductModuleDto: CreateProductModuleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productModuleService.create(createProductModuleDto, files);
  }

  // Anyone browsing the public catalog can see the list of products.
  @AllowAnonymous()
  @Get()
  findAll() {
    return this.productModuleService.findAll();
  }

  // Anyone can view a single product's details too.
  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productModuleService.findOne(id);
  }

  // Only logged-in staff can edit a product.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductModuleDto: UpdateProductModuleDto,
  ) {
    return this.productModuleService.update(+id, updateProductModuleDto);
  }

  // Only logged-in staff can delete a product.
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productModuleService.remove(+id);
  }
}
