import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsGateway } from './promotions.gateway.js';

describe('PromotionsGateway', () => {
  let gateway: PromotionsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionsGateway],
    }).compile();

    gateway = module.get<PromotionsGateway>(PromotionsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
