
import type { PixCharge, PixWebhookPayload } from '../types';
import { v4 as uuidv4 } from 'uuid'; // A small utility for generating unique IDs

/**
 * Mocks calling a PSP (Payment Service Provider) to generate a dynamic PIX charge.
 * In a real application, this would be an API call.
 */
export const generateDynamicPix = (total: number): Promise<PixCharge> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const transactionId = uuidv4();
            const charge: PixCharge = {
                transactionId,
                qrCodeData: `00020126580014br.gov.bcb.pix0136${transactionId}5204000053039865802BR5913Empresa Teste6009Sao Paulo62070503***6304E${Math.floor(Math.random() * 9000 + 1000)}`,
                amount: total,
                createdAt: new Date(),
            };
            
            console.log(`[SECURITY_LOG] PIX charge created for R$${total.toFixed(2)}. Transaction ID: ${transactionId}`);
            resolve(charge);
        }, 1200); // Simulate network delay to PSP
    });
};

/**
 * Mocks listening for a webhook from the PSP to confirm payment.
 * Returns an `unsubscribe` function to clean up the listener.
 */
export const listenForPixPayment = (
    transactionId: string, 
    onPaymentConfirmed: (payload: PixWebhookPayload) => void
): (() => void) => {
    console.log(`[AUDIT_LOG] Started listening for payment confirmation for transaction ${transactionId}.`);
    
    // Simulate a random payment time between 3 and 8 seconds
    const paymentDelay = Math.random() * 5000 + 3000; 

    const timeoutId = setTimeout(() => {
        const payload: PixWebhookPayload = {
            transactionId: transactionId,
            status: 'PAID',
            paidAt: new Date(),
            amount: 0, // In a real scenario, this would be the paid amount
        };
        console.log(`[SECURITY_LOG] Webhook received: Payment confirmed for transaction ${transactionId}.`);
        onPaymentConfirmed(payload);
    }, paymentDelay);

    // Return a function to cancel the listener
    return () => {
        console.log(`[AUDIT_LOG] Stopped listening for payment confirmation for transaction ${transactionId}.`);
        clearTimeout(timeoutId);
    };
};
