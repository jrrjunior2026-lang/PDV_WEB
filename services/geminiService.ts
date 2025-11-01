import apiClient from './apiClient';
import type { SaleRecord, Product } from '../types';

// All functions now call the backend API instead of Google GenAI directly.

export const generateBusinessInsights = async (salesHistory: SaleRecord[], products: Product[]): Promise<string> => {
    const response = await apiClient.post<{ insights: string }>('/gemini/insights', { salesHistory, products });
    return response.insights;
};

export const answerBusinessQuery = async (query: string, salesHistory: SaleRecord[], products: Product[]): Promise<string> => {
    const response = await apiClient.post<{ answer: string }>('/gemini/query', { query, salesHistory, products });
    return response.answer;
};

export const suggestProductName = async (currentName: string, category: string): Promise<string> => {
    const response = await apiClient.post<{ suggestion: string }>('/gemini/suggest-name', { currentName, category });
    return response.suggestion;
};

export const parseAddToCartCommand = async (command: string, products: Product[]): Promise<{ productName: string, quantity: number }[]> => {
    try {
        const response = await apiClient.post<{ items: { productName: string, quantity: number }[] }>('/gemini/parse-command', { command, products });
        return response.items || [];
    } catch (error) {
        console.error("Failed to parse voice command via backend:", error);
        return [];
    }
}