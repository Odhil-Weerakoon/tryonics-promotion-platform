import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';

@Global() // Makes the SupabaseService available app-wide
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService], // Export it so other modules can use it
})
export class SupabaseModule {}
