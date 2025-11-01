import { GoogleGenAI, Type } from "@google/genai";
import type { SaleRecord, Product } from '../types';

let ai: GoogleGenAI | null = null;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const sanitizeDataForPrompt = (data: any[]) => {
    // Basic serialization to avoid sending too much data
    return JSON.stringify(data.slice(0, 50).map(item => {
        const smallItem: Record<string, any> = {};
        for(const key in item) {
            if (typeof item[key] !== 'object') {
                smallItem[key] = item[key];
            }
        }
        return smallItem;
    }));
}

export const generateBusinessInsights = async (salesHistory: SaleRecord[], products: Product[]): Promise<string> => {
    const prompt = `
        Você é um analista de negócios especialista em varejo. Analise os seguintes dados de vendas e produtos de uma cafeteria e forneça 3 insights acionáveis e concisos em português.
        
        Dados de Vendas (últimas 50): ${sanitizeDataForPrompt(salesHistory)}
        
        Lista de Produtos: ${sanitizeDataForPrompt(products)}
        
        Exemplo de insight: "Notei que as vendas de Café Espresso aumentam 30% após as 16h. Considere criar um combo de fim de tarde."
        
        Forneça os insights em uma lista com marcadores.
    `;
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const answerBusinessQuery = async (query: string, salesHistory: SaleRecord[], products: Product[]): Promise<string> => {
    const prompt = `
        Você é um analista de dados. Responda à seguinte pergunta do gerente da loja com base nos dados fornecidos. Seja direto e use os dados para embasar sua resposta em português.

        Pergunta: "${query}"

        Dados de Vendas (últimas 50): ${sanitizeDataForPrompt(salesHistory)}
        
        Lista de Produtos: ${sanitizeDataForPrompt(products)}
    `;
     const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const suggestProductName = async (currentName: string, category: string): Promise<string> => {
    const prompt = `
        Sugira um nome de produto mais criativo e vendedor para uma cafeteria, baseado no nome atual e na categoria. Retorne apenas o novo nome, sem aspas ou texto adicional.

        Nome Atual: "${currentName}"
        Categoria: "${category}"
        
        Exemplo:
        Nome Atual: "Bolo de Chocolate"
        Categoria: "Doces"
        Resposta Exemplo: "Bolo de Chocolate Intenso"
    `;
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
};

export const parseAddToCartCommand = async (command: string, products: Product[]): Promise<{ productName: string, quantity: number }[]> => {
    const productNames = products.map(p => p.name).join(', ');
    const prompt = `
        Analise o seguinte comando de voz de um operador de caixa e extraia os produtos e suas respectivas quantidades.
        
        Comando: "${command}"

        Lista de produtos disponíveis para referência: ${productNames}.

        Responda apenas com o JSON.
    `;

    const response = await getAI().models.generateContent({
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
