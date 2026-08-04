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
import { QuoteRequestModuleService } from './quote-request-module.service';
import { CreateQuoteRequestModuleDto } from './dto/create-quote-request-module.dto';
import { UpdateQuoteRequestModuleDto } from './dto/update-quote-request-module.dto';

@Controller('quote-request-module')
export class QuoteRequestModuleController {
  constructor(
    private readonly quoteRequestModuleService: QuoteRequestModuleService,
  ) {}

  // Customers submit a quote request WITHOUT logging in — this is the
  // "backup audit trail" saved right before they get sent to WhatsApp.
  @AllowAnonymous()
  @Post()
  create(@Body() createQuoteRequestModuleDto: CreateQuoteRequestModuleDto) {
    return this.quoteRequestModuleService.create(createQuoteRequestModuleDto);
  }

  // Only staff can see the list of quote request "leads".
  @Get()
  findAll() {
    return this.quoteRequestModuleService.findAll();
  }

  // Only staff can view one quote request's details.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quoteRequestModuleService.findOne(id);
  }

  // Only staff can update a quote request's status (e.g. mark it RESPONDED).
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuoteRequestModuleDto: UpdateQuoteRequestModuleDto,
  ) {
    return this.quoteRequestModuleService.update(
      +id,
      updateQuoteRequestModuleDto,
    );
  }

  // Only staff can delete a quote request.
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quoteRequestModuleService.remove(+id);
  }
}
