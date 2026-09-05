import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // Public endpoint: Viewers and unauthenticated users can fetch promotions for the landing page
  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  // Protected: Only Operators and Admins can create promotions[cite: 3]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Operator', 'Admin')
  @Post()
  create(@Body() createPromotionDto: any) {
    return this.promotionsService.create(createPromotionDto);
  }

  // Protected: Only Operators and Admins can update promotions[cite: 3]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Operator', 'Admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: any) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  // Protected: Only Operators and Admins can delete promotions[cite: 3]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Operator', 'Admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
