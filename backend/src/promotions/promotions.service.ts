import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { PromotionsGateway } from './promotions.gateway.js';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly promotionsGateway: PromotionsGateway,
  ) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(createPromotionDto: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('promotions')
      .insert([createPromotionDto])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    // Broadcast the new promotion to all active browser sessions!
    this.promotionsGateway.broadcastPromotionEvent('promotionCreated', data);

    return data;
  }

  async update(id: string, updatePromotionDto: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('promotions')
      .update(updatePromotionDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    // Broadcast the updated promotion
    this.promotionsGateway.broadcastPromotionEvent('promotionUpdated', data);

    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('promotions')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    // Broadcast the ID of the removed promotion so the frontend can hide it
    this.promotionsGateway.broadcastPromotionEvent('promotionRemoved', { id });

    return data;
  }
}
