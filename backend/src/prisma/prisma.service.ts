import { Injectable, OnModuleInit } from '@nestjs/common';
// FIX: Use a named import for PrismaClient for proper type resolution and inheritance.
import { PrismaClient } from '@prisma/client';

@Injectable()
// FIX: Extend from the correctly imported PrismaClient to inherit its methods and properties.
export class PrismaService extends PrismaClient implements OnModuleInit {
  // FIX: A constructor with super() is necessary when extending a class.
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
}