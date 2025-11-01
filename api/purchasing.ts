import { v4 as uuidv4 } from 'uuid';
import type { PurchaseOrder } from '../types';
import * as inventoryApi from './inventory';

const PURCHASE_ORDERS_KEY = 'pdv-purchase-orders';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setToStorage = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getPurchaseOrders = (): Promise<PurchaseOrder[]> => {
  return Promise.resolve(getFromStorage<PurchaseOrder[]>(PURCHASE_ORDERS_KEY, []));
};

export const addPurchaseOrder = (
  orderData: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt'>
): Promise<PurchaseOrder> => {
  return new Promise(resolve => {
    const orders = getFromStorage<PurchaseOrder[]>(PURCHASE_ORDERS_KEY, []);
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: `oc-${uuidv4()}`,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    };
    const updatedOrders = [...orders, newOrder];
    setToStorage(PURCHASE_ORDERS_KEY, updatedOrders);
    console.log(`[API_LOG] Purchase Order ${newOrder.id} created.`);
    resolve(newOrder);
  });
};

export const updatePurchaseOrderStatus = (
  orderId: string,
  status: 'Recebido' | 'Cancelado'
): Promise<PurchaseOrder> => {
  return new Promise(async (resolve, reject) => {
    const orders = getFromStorage<PurchaseOrder[]>(PURCHASE_ORDERS_KEY, []);
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return reject(new Error('Purchase Order not found'));
    }

    const orderToUpdate = { ...orders[orderIndex] };
    if (orderToUpdate.status !== 'Pendente') {
        return reject(new Error(`Cannot change status of an order that is already ${orderToUpdate.status}`));
    }

    orderToUpdate.status = status;
    if (status === 'Recebido') {
      orderToUpdate.receivedAt = new Date().toISOString();
      // Integrate with inventory
      await inventoryApi.processPurchaseOrderReceival(orderToUpdate);
    }
    
    orders[orderIndex] = orderToUpdate;
    setToStorage(PURCHASE_ORDERS_KEY, orders);
    console.log(`[API_LOG] Purchase Order ${orderId} status updated to ${status}.`);
    resolve(orderToUpdate);
  });
};
