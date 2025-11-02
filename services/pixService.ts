import apiClient from './apiClient';
import type { PixCharge } from '../types';

/**
 * Requests the backend to generate a new PIX charge for a given amount.
 * 
 * @param amount The value of the PIX charge to be created.
 * @returns A promise that resolves with the PIX charge details, including the QR code data.
 */
export const generatePixCharge = async (amount: number): Promise<PixCharge> => {
    try {
        const response = await apiClient.post<PixCharge>('/pix/generate', { amount });
        return response;
    } catch (error) {
        console.error("Error generating PIX charge:", error);
        // Re-throw the error to be handled by the calling component
        throw error;
    }
};
