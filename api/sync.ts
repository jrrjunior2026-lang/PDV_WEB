

import { v4 as uuidv4 } from 'uuid';
import type { QueuedSale, SaleRecord } from '../types';
import * as inventoryApi from './inventory';

const SALE_QUEUE_KEY = 'pdv-offline-sale-queue';
const SALES_HISTORY_KEY = 'pdv-sales-history'; // Our "database" for sales

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
 * Retrieves all persisted sales records.
 */
export const getSalesHistory = (): SaleRecord[] => {
    try {
        const historyJson = localStorage.getItem(SALES_HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to parse sales history from localStorage:", error);
        return [];
    }
}

/**
 * Updates a key in localStorage.
 */
const updateStorage = (key: string, data: any[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Records a completed sale. If online, it's added directly to history.
 * If offline, it's added to the sync queue.
 * CRITICALLY, it also updates the inventory.
 */
export const recordSale = (saleData: SaleRecord, isOnline: boolean): void => {
    const history = getSalesHistory();
    updateStorage(SALES_HISTORY_KEY, [...history, saleData]);

    // Update inventory levels based on the sale
    inventoryApi.processSaleStockAdjustment(saleData);

    if (!isOnline) {
        const queue = getQueuedSales();
        const newQueuedSale: QueuedSale = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            saleData,
        };
        updateStorage(SALE_QUEUE_KEY, [...queue, newQueuedSale]);
        console.log(`[API_LOG] Sale queued for offline sync. Pending: ${queue.length + 1}`);
    } else {
        console.log(`[API_LOG] Sale recorded directly to history.`);
    }
};

/**
 * Simulates synchronizing pending sales with a central server.
 */
export const synchronizeSales = (salesToSync: QueuedSale[]): Promise<{ syncedIds: string[] }> => {
  return new Promise((resolve, reject) => {
    console.log(`[API_LOG] Syncing ${salesToSync.length} sale(s)...`);
    setTimeout(() => {
      if (Math.random() < 0.1) {
        console.error("[API_LOG] Sync failed: Mock network error.");
        return reject(new Error("Falha na sincronização."));
      }
      const syncedIds = salesToSync.map(s => s.id);
      console.log("[API_LOG] Sync successful.", { syncedIds });
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
    updateStorage(SALE_QUEUE_KEY, newQueue);
    console.log(`[API_LOG] Cleared ${syncedIds.length} synced sales. Pending: ${newQueue.length}`);
};