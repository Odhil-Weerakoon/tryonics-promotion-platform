import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(createUserDto: {
    email: string;
    password: string;
    role: 'Admin' | 'Operator';
  }) {
    const supabase = this.supabaseService.getClient();
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: createUserDto.email,
          password_hash: hashedPassword,
          role: createUserDto.role,
        },
      ])
      .select('id, email, role, created_at')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException('User not found');
    return { message: 'User successfully deleted', data };
  }
}
