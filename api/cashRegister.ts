import { v4 as uuidv4 } from 'uuid';
import type { CashShift, SaleRecord, ShiftMovement, PaymentMethod } from '../types';

const ACTIVE_SHIFT_KEY = 'pdv-active-shift';
const SHIFT_HISTORY_KEY = 'pdv-shift-history';

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

/**
 * Retrieves the currently active shift, if any.
 */
export const getCurrentShift = (): Promise<CashShift | null> => {
    return Promise.resolve(getFromStorage<CashShift | null>(ACTIVE_SHIFT_KEY, null));
};

/**
 * Retrieves the history of all closed shifts.
 */
export const getShiftHistory = (): Promise<CashShift[]> => {
    return Promise.resolve(getFromStorage<CashShift[]>(SHIFT_HISTORY_KEY, []));
};

/**
 * Opens a new cash register shift.
 */
export const openShift = (openingBalance: number, user: { id: string, name: string }): Promise<CashShift> => {
    return new Promise(async (resolve, reject) => {
        const currentShift = await getCurrentShift();
        if (currentShift) {
            return reject(new Error('Um turno já está aberto.'));
        }

        const newShift: CashShift = {
            id: `shift-${uuidv4()}`,
            status: 'Aberto',
            userId: user.id,
            userName: user.name,
            openedAt: new Date().toISOString(),
            closedAt: null,
            openingBalance,
            closingBalance: null,
            expectedBalance: null,
            balanceDifference: null,
            totalSales: 0,
            totalSuprimentos: openingBalance, // Initial funding is a "suprimento"
            totalSangrias: 0,
            paymentTotals: { 'Dinheiro': 0, 'PIX': 0, 'Credito': 0, 'Debito': 0 },
            movements: [{
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                type: 'Suprimento',
                amount: openingBalance,
                reason: 'Abertura de caixa',
                userId: user.id,
            }],
            sales: [],
        };

        setToStorage(ACTIVE_SHIFT_KEY, newShift);
        console.log(`[API_LOG] Shift ${newShift.id} opened by ${user.name} with R$${openingBalance.toFixed(2)}.`);
        resolve(newShift);
    });
};

/**
 * Adds a completed sale to the current active shift.
 */
export const addSaleToShift = (sale: SaleRecord): Promise<CashShift> => {
    return new Promise(async (resolve, reject) => {
        const shift = await getCurrentShift();
        if (!shift) {
            return reject(new Error('Nenhum turno aberto para registrar a venda.'));
        }

        shift.sales.push(sale);
        shift.totalSales += sale.total;
        
        sale.payments.forEach(payment => {
            shift.paymentTotals[payment.method] = (shift.paymentTotals[payment.method] || 0) + payment.amount;
        });

        setToStorage(ACTIVE_SHIFT_KEY, shift);
        console.log(`[API_LOG] Sale ${sale.id} added to shift ${shift.id}.`);
        resolve(shift);
    });
};

/**
 * Records a cash movement (Suprimento or Sangria) in the current shift.
 */
export const recordMovement = (type: 'Suprimento' | 'Sangria', amount: number, reason: string, user: { id: string }): Promise<CashShift> => {
    return new Promise(async (resolve, reject) => {
        const shift = await getCurrentShift();
        if (!shift) {
            return reject(new Error('Nenhum turno aberto para registrar a movimentação.'));
        }

        const movement: ShiftMovement = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type,
            amount,
            reason,
            userId: user.id,
        };
        shift.movements.push(movement);

        if (type === 'Suprimento') {
            shift.totalSuprimentos += amount;
        } else {
            shift.totalSangrias += amount;
        }

        setToStorage(ACTIVE_SHIFT_KEY, shift);
        console.log(`[API_LOG] ${type} of R$${amount.toFixed(2)} recorded in shift ${shift.id}.`);
        resolve(shift);
    });
};


/**
 * Closes the current active shift.
 */
export const closeShift = (closingBalance: number): Promise<CashShift> => {
    return new Promise(async (resolve, reject) => {
        const shift = await getCurrentShift();
        if (!shift) {
            return reject(new Error('Nenhum turno aberto para fechar.'));
        }
        
        const cashSales = shift.paymentTotals['Dinheiro'] || 0;
        const suprimentosAfterOpening = shift.totalSuprimentos - shift.openingBalance;
        const expectedBalance = shift.openingBalance + cashSales + suprimentosAfterOpening - shift.totalSangrias;
        
        shift.status = 'Fechado';
        shift.closedAt = new Date().toISOString();
        shift.closingBalance = closingBalance;
        shift.expectedBalance = expectedBalance;
        shift.balanceDifference = closingBalance - expectedBalance;

        const history = await getShiftHistory();
        setToStorage(SHIFT_HISTORY_KEY, [...history, shift]);
        localStorage.removeItem(ACTIVE_SHIFT_KEY);
        
        console.log(`[API_LOG] Shift ${shift.id} closed. Expected Cash: R$${expectedBalance.toFixed(2)}, Counted: R$${closingBalance.toFixed(2)}, Difference: R$${shift.balanceDifference.toFixed(2)}.`);
        resolve(shift);
    });
};