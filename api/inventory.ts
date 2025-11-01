import { v4 as uuidv4 } from 'uuid';
import type { StockLevel, StockMovement, SaleRecord, InventoryCountItem, InventoryReport, PurchaseOrder } from '../types';
// FIX: The imported variable name has been corrected to match the export from products.ts.
import { MOCK_PRODUCTS } from './products';

const STOCK_LEVELS_KEY = 'pdv-stock-levels';
const STOCK_MOVEMENTS_KEY = 'pdv-stock-movements';

// --- UTILITY FUNCTIONS ---

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// --- INITIALIZATION ---

const initializeStock = () => {
  let levels = getFromStorage<StockLevel[]>(STOCK_LEVELS_KEY, []);
  if (levels.length === 0) {
    const movements: StockMovement[] = [];
    // FIX: Use the correctly imported MOCK_PRODUCTS variable.
    levels = MOCK_PRODUCTS.map(p => {
      const initialQuantity = Math.floor(Math.random() * 80) + 20; // Start with 20-100 items
      movements.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        productId: p.id,
        productName: p.name,
        type: 'Entrada Inicial',
        quantityChange: initialQuantity,
        reason: 'Carga inicial do sistema',
      });
      return {
        productId: p.id,
        productName: p.name,
        quantity: initialQuantity,
      };
    });
    setToStorage(STOCK_LEVELS_KEY, levels);
    setToStorage(STOCK_MOVEMENTS_KEY, movements);
    console.log('[API_LOG] Initialized stock levels and movements.');
  }
};

// Initialize on module load
initializeStock();

// --- API FUNCTIONS ---

export const getStockLevels = (): Promise<StockLevel[]> => {
  return Promise.resolve(getFromStorage<StockLevel[]>(STOCK_LEVELS_KEY, []));
};

export const getStockMovements = (): Promise<StockMovement[]> => {
  return Promise.resolve(getFromStorage<StockMovement[]>(STOCK_MOVEMENTS_KEY, []));
};

export const processPurchaseOrderReceival = (order: PurchaseOrder): Promise<void> => {
    return new Promise(resolve => {
        const levels = getFromStorage<StockLevel[]>(STOCK_LEVELS_KEY, []);
        const movements = getFromStorage<StockMovement[]>(STOCK_MOVEMENTS_KEY, []);
        const timestamp = new Date().toISOString();

        order.items.forEach(item => {
            let stockItem = levels.find(l => l.productId === item.productId);
            if (stockItem) {
                stockItem.quantity += item.quantity;
            } else {
                stockItem = { productId: item.productId, productName: item.productName, quantity: item.quantity };
                levels.push(stockItem);
            }

            movements.push({
                id: uuidv4(),
                timestamp,
                productId: item.productId,
                productName: item.productName,
                type: 'Entrada (Compra)',
                quantityChange: item.quantity,
                reason: `OC #${order.id.substring(0, 8)}`,
            });
        });
        
        setToStorage(STOCK_LEVELS_KEY, levels);
        setToStorage(STOCK_MOVEMENTS_KEY, movements);
        console.log(`[API_LOG] Stock entry from Purchase Order ${order.id} processed.`);
        resolve();
    });
};

export const recordStockEntry = (
  entries: { productId: string; productName: string; quantity: number }[],
  reason: string
): Promise<void> => {
  return new Promise(resolve => {
    const levels = getFromStorage<StockLevel[]>(STOCK_LEVELS_KEY, []);
    const movements = getFromStorage<StockMovement[]>(STOCK_MOVEMENTS_KEY, []);
    const timestamp = new Date().toISOString();

    entries.forEach(entry => {
      let stockItem = levels.find(l => l.productId === entry.productId);
      if (stockItem) {
        stockItem.quantity += entry.quantity;
      } else {
        // This handles a newly created product from the XML
        stockItem = {
          productId: entry.productId,
          productName: entry.productName,
          quantity: entry.quantity,
        };
        levels.push(stockItem);
      }
      
      movements.push({
        id: uuidv4(),
        timestamp,
        productId: entry.productId,
        productName: entry.productName,
        type: 'Entrada (NF-e)',
        quantityChange: entry.quantity,
        reason,
      });
    });

    setToStorage(STOCK_LEVELS_KEY, levels);
    setToStorage(STOCK_MOVEMENTS_KEY, movements);
    console.log(`[API_LOG] Stock entry recorded for reason: ${reason}.`);
    resolve();
  });
};

export const processSaleStockAdjustment = (sale: SaleRecord): void => {
  const levels = getFromStorage<StockLevel[]>(STOCK_LEVELS_KEY, []);
  const movements = getFromStorage<StockMovement[]>(STOCK_MOVEMENTS_KEY, []);

  sale.items.forEach(item => {
    const stockItem = levels.find(l => l.productId === item.id);
    if (stockItem) {
      const quantityChange = -item.quantity;
      stockItem.quantity += quantityChange;
      movements.push({
        id: uuidv4(),
        timestamp: sale.timestamp,
        productId: item.id,
        productName: item.name,
        type: 'Venda',
        quantityChange,
        reason: `Venda #${sale.id.substring(0, 8)}`,
      });
    }
  });

  setToStorage(STOCK_LEVELS_KEY, levels);
  setToStorage(STOCK_MOVEMENTS_KEY, movements);
  console.log(`[API_LOG] Stock adjusted for sale #${sale.id.substring(0, 8)}.`);
};

export const processInventoryCount = (
    counts: InventoryCountItem[]
): Promise<InventoryReport> => {
    return new Promise(resolve => {
        const levels = getFromStorage<StockLevel[]>(STOCK_LEVELS_KEY, []);
        const movements = getFromStorage<StockMovement[]>(STOCK_MOVEMENTS_KEY, []);
        const report: InventoryReport = {
            discrepancies: [],
            timestamp: new Date().toISOString()
        };
        const countId = `INV-${uuidv4().substring(0, 8)}`;

        counts.forEach(countedItem => {
            const stockItem = levels.find(l => l.productId === countedItem.productId);
            if (stockItem) {
                const difference = countedItem.countedQuantity - stockItem.quantity;
                if (difference !== 0) {
                    report.discrepancies.push({
                        productId: stockItem.productId,
                        productName: stockItem.productName,
                        expected: stockItem.quantity,
                        counted: countedItem.countedQuantity,
                        difference,
                    });
                    
                    // Adjust stock and log movement
                    stockItem.quantity = countedItem.countedQuantity;
                    movements.push({
                        id: uuidv4(),
                        timestamp: report.timestamp,
                        productId: stockItem.productId,
                        productName: stockItem.productName,
                        type: 'Ajuste de Inventário',
                        quantityChange: difference,
                        reason: `Contagem ${countId}`
                    });
                }
            }
        });

        setToStorage(STOCK_LEVELS_KEY, levels);
        setToStorage(STOCK_MOVEMENTS_KEY, movements);
        console.log(`[API_LOG] Inventory count ${countId} processed. Found ${report.discrepancies.length} discrepancies.`);
        resolve(report);
    });
};