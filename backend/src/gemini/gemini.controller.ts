import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    @Post('insights')
    async getInsights(@Body() body: { salesHistory: any[], products: any[] }) {
        const insights = await this.geminiService.generateBusinessInsights(body.salesHistory, body.products);
        return { insights };
    }

    @Post('query')
    async getQueryAnswer(@Body() body: { query: string, salesHistory: any[], products: any[] }) {
        const answer = await this.geminiService.answerBusinessQuery(body.query, body.salesHistory, body.products);
        return { answer };
    }

    @Post('suggest-name')
    async suggestName(@Body() body: { currentName: string, category: string }) {
        const suggestion = await this.geminiService.suggestProductName(body.currentName, body.category);
        return { suggestion };
    }

    @Post('parse-command')
    async parseCommand(@Body() body: { command: string, products: any[] }) {
        const items = await this.geminiService.parseAddToCartCommand(body.command, body.products);
        return { items };
    }
}
