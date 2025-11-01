import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from "@google/genai";

@Injectable()
export class GeminiService implements OnModuleInit {
    private ai: GoogleGenAI;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const apiKey = this.configService.get<string>('API_KEY');
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set for Gemini");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    private sanitizeDataForPrompt(data: any[]): string {
        return JSON.stringify(data.slice(0, 50).map(item => {
            const smallItem: Record<string, any> = {};
            for (const key in item) {
                if (typeof item[key] !== 'object' || item[key] === null) {
                    smallItem[key] = item[key];
                }
            }
            return smallItem;
        }));
    }

    async generateBusinessInsights(salesHistory: any[], products: any[]): Promise<string> {
        const prompt = `
            Você é um analista de negócios especialista em varejo. Analise os seguintes dados de vendas e produtos de uma cafeteria e forneça 3 insights acionáveis e concisos em português.
            Dados de Vendas (últimas 50): ${this.sanitizeDataForPrompt(salesHistory)}
            Lista de Produtos: ${this.sanitizeDataForPrompt(products)}
            Exemplo de insight: "Notei que as vendas de Café Espresso aumentam 30% após as 16h. Considere criar um combo de fim de tarde."
            Forneça os insights em uma lista com marcadores.
        `;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    }

    async answerBusinessQuery(query: string, salesHistory: any[], products: any[]): Promise<string> {
        const prompt = `
            Você é um analista de dados. Responda à seguinte pergunta do gerente da loja com base nos dados fornecidos. Seja direto e use os dados para embasar sua resposta em português.
            Pergunta: "${query}"
            Dados de Vendas (últimas 50): ${this.sanitizeDataForPrompt(salesHistory)}
            Lista de Produtos: ${this.sanitizeDataForPrompt(products)}
        `;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    }

    async suggestProductName(currentName: string, category: string): Promise<string> {
        const prompt = `
            Sugira um nome de produto mais criativo e vendedor para uma cafeteria, baseado no nome atual e na categoria. Retorne apenas o novo nome, sem aspas ou texto adicional.
            Nome Atual: "${currentName}"
            Categoria: "${category}"
        `;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    }

    async parseAddToCartCommand(command: string, products: any[]): Promise<{ productName: string, quantity: number }[]> {
        const productNames = products.map(p => p.name).join(', ');
        const prompt = `
            Analise o seguinte comando de voz de um operador de caixa e extraia os produtos e suas respectivas quantidades.
            Comando: "${command}"
            Lista de produtos disponíveis para referência: ${productNames}.
            Responda apenas com o JSON.
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            productName: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                        },
                        required: ["productName", "quantity"],
                    },
                },
            },
        });

        try {
            const jsonText = response.text.trim();
            return JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", e);
            return [];
        }
    }
}
