import apiClient from './apiClient';
import type { SaleRecord } from '../types';

/**
 * The response from the backend after an attempt to issue an NFC-e.
 */
export interface NFCeIssuanceResponse {
    success: boolean;
    nfceXml: string; // The full, signed XML of the NFC-e
    danfeUrl?: string; // URL to the DANFE (visual representation)
    message: string; // Success or error message
}

/**
 * Sends sale data to the backend to generate and transmit an NFC-e.
 * 
 * @param sale The completed sale record.
 * @returns A promise that resolves with the issuance result.
 */
export const issueNFCe = async (sale: SaleRecord): Promise<NFCeIssuanceResponse> => {
    try {
        const response = await apiClient.post<NFCeIssuanceResponse>('/fiscal/issue-nfce', { sale });
        return response;
    } catch (error) {
        console.error("Error issuing NFC-e:", error);
        // Ensure a consistent error response format
        return {
            success: false,
            nfceXml: '',
            message: (error instanceof Error) ? error.message : 'An unknown error occurred during NFC-e issuance.',
        };
    }
};
