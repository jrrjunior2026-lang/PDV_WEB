import apiClient from './apiClient';
import type { QueuedSale } from '../types';

const QUEUE_KEY = 'pdv-sale-queue';

/**
 * Adds a sale to the offline queue.
 * @param saleData The sale record to be queued.
 */
export const queueSale = (saleData: QueuedSale): void => {
  try {
    const queue = getQueue();
    queue.push(saleData);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to queue sale:", error);
  }
};

/**
 * Retrieves the current sale queue from localStorage.
 * @returns An array of queued sales.
 */
export const getQueue = (): QueuedSale[] => {
  try {
    const queueJson = localStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error("Failed to retrieve sale queue:", error);
    return [];
  }
};

/**
 * Clears the sale queue from localStorage.
 */
export const clearQueue = (): void => {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error("Failed to clear sale queue:", error);
  }
};

/**
 * Attempts to sync all queued sales with the backend.
 * @returns A promise that resolves with the number of successfully synced sales.
 */
export const processSyncQueue = async (): Promise<number> => {
    const queue = getQueue();
    if (queue.length === 0) {
        return 0;
    }

    try {
        // In a real scenario, this would be a single endpoint that accepts an array of sales.
        // Here we simulate sending them one by one.
        const syncPromises = queue.map(queuedSale => 
            apiClient.post('/sales', queuedSale.saleData)
        );
        
        await Promise.all(syncPromises);

        // If all successful, clear the queue
        clearQueue();
        return queue.length;

    } catch (error) {
        console.error("Failed to sync offline sales:", error);
        // Depending on the error, you might want to implement more robust logic,
        // like removing only the successfully synced items from the queue.
        return 0;
    }
};
