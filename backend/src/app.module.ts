import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigService disponível em toda a aplicação
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GeminiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
