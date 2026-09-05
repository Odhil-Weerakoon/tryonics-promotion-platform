import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller.js';
import { PromotionsService } from './promotions.service.js';
import { PromotionsGateway } from './promotions.gateway.js';

@Module({
  controllers: [PromotionsController],
  providers: [PromotionsService, PromotionsGateway]
})
export class PromotionsModule {}
