import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// FIX: Use a named import for the User model type from the generated Prisma Client.
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}