import { GoogleGenAI, Type } from "@google/genai";
import type { SaleRecord, Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to sanitize data to avoid sending huge prompts
const sanitizeDataForPrompt = (data: any[]): string => {
    // Stringify a limited subset of data to keep prompts concise
    return JSON.stringify(data.slice(0, 20).map(item => {
        const smallItem: Record<string, any> = {};
        // Take only a few properties to avoid large objects
        const keys = Object.keys(item).slice(0, 5);
        for (const key of keys) {
            if (typeof item[key] !== 'object' || item[key] === null) {
                smallItem[key] = item[key];
            }
        }
        return smallItem;
    }));
};


export const generateBusinessInsights = async (salesHistory: SaleRecord[], products: Product[]): Promise<string> => {
    const prompt = `
        Você é um analista de negócios especialista em varejo. Analise os seguintes dados de vendas e produtos de uma cafeteria e forneça 3 insights acionáveis e concisos em português.
        Dados de Vendas (últimas 20): ${sanitizeDataForPrompt(salesHistory)}
        Lista de Produtos: ${sanitizeDataForPrompt(products)}
        Exemplo de insight: "Notei que as vendas de Café Espresso aumentam 30% após as 16h. Considere criar um combo de fim de tarde."
        Forneça os insights em uma lista com marcadores.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const answerBusinessQuery = async (query: string, salesHistory: SaleRecord[], products: Product[]): Promise<string> => {
     const prompt = `
        Você é um analista de dados. Responda à seguinte pergunta do gerente da loja com base nos dados fornecidos. Seja direto e use os dados para embasar sua resposta em português.
        Pergunta: "${query}"
        Dados de Vendas (últimas 20): ${sanitizeDataForPrompt(salesHistory)}
        Lista de Produtos: ${sanitizeDataForPrompt(products)}
    `;
    const response = await ai.models.generateContent({
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
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim().replace(/"/g, ''); // Clean up output
};


export const parseAddToCartCommand = async (command: string, products: Product[]): Promise<{ productName: string, quantity: number }[]> => {
    const productNames = products.map(p => p.name).join(', ');
    const prompt = `
        Analise o seguinte comando de voz de um operador de caixa e extraia os produtos e suas respectivas quantidades.
        Comando: "${command}"
        Lista de produtos disponíveis para referência: ${productNames}.
        Responda apenas com o JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            productName: {
                                type: Type.STRING,
                                description: "Nome do produto como aparece na lista de produtos disponíveis."
                            },
                            quantity: {
                                type: Type.NUMBER,
                                description: "A quantidade do produto."
                            },
                        },
                        required: ["productName", "quantity"],
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        // Ensure the result is an array
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to parse voice command with Gemini:", error);
        return [];
    }
};
