import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // FIX: Added constructor to properly initialize the extended PrismaClient.
  // The 'super()' call is essential for the subclass to inherit methods
  // like '$connect' and model properties like 'user'.
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
}