import { v4 as uuidv4 } from 'uuid';
import type { QueuedSale, CartItem } from '../types';

const SALE_QUEUE_KEY = 'pdv-offline-sale-queue';

/**
 * Retrieves the current queue of sales from localStorage.
 */
export const getQueuedSales = (): QueuedSale[] => {
  try {
    const queueJson = localStorage.getItem(SALE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error("Failed to parse sale queue from localStorage:", error);
    return [];
  }
};

/**
 * Updates the sale queue in localStorage.
 */
const updateQueue = (queue: QueuedSale[]): void => {
  localStorage.setItem(SALE_QUEUE_KEY, JSON.stringify(queue));
};


/**
 * Adds a completed sale to the offline queue.
 */
export const addSaleToQueue = (sale: { items: CartItem[], total: number }): void => {
  const currentQueue = getQueuedSales();
  const newQueuedSale: QueuedSale = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    items: sale.items,
    total: sale.total,
  };
  const newQueue = [...currentQueue, newQueuedSale];
  updateQueue(newQueue);
  console.log(`[SYNC_SERVICE] Sale queued. Pending sales: ${newQueue.length}`);
};


/**
 * Simulates synchronizing pending sales with a central server.
 */
export const synchronizeSales = (salesToSync: QueuedSale[]): Promise<{ syncedIds: string[] }> => {
  return new Promise((resolve, reject) => {
    console.log(`[SYNC_SERVICE] Starting synchronization for ${salesToSync.length} sale(s)...`);
    
    // Simulate network delay
    setTimeout(() => {
      // Simulate a possible network error (10% chance)
      if (Math.random() < 0.1) {
        console.error("[SYNC_SERVICE] Synchronization failed: Mock network error.");
        reject(new Error("Falha na sincronização. Verifique sua conexão."));
        return;
      }
      
      const syncedIds = salesToSync.map(sale => sale.id);
      console.log("[SYNC_SERVICE] Synchronization successful.", { syncedIds });
      resolve({ syncedIds });
    }, 2500);
  });
};

/**
 * Removes successfully synchronized sales from the queue.
 */
export const clearSyncedSales = (syncedIds: string[]): void => {
    const currentQueue = getQueuedSales();
    const newQueue = currentQueue.filter(sale => !syncedIds.includes(sale.id));
    updateQueue(newQueue);
    console.log(`[SYNC_SERVICE] Cleared ${syncedIds.length} synced sales. Pending sales: ${newQueue.length}`);
};
