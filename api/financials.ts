
import { v4 as uuidv4 } from 'uuid';
import type { AccountTransaction } from '../types';

const FINANCIALS_KEY = 'pdv-financials';

const MOCK_FINANCIALS_INITIAL: AccountTransaction[] = [
  // Contas a Pagar
  { id: 'p1', description: 'Fornecedor de Café Grãos S.A.', amount: 1250.75, dueDate: '2024-08-10', status: 'Pendente', type: 'payable' },
  { id: 'p2', description: 'Aluguel do Ponto Comercial', amount: 3500.00, dueDate: '2024-08-05', status: 'Pago', type: 'payable' },
  { id: 'p3', description: 'Conta de Energia Elétrica', amount: 430.50, dueDate: '2024-07-20', status: 'Atrasado', type: 'payable' },
  { id: 'p4', description: 'Distribuidora de Embalagens', amount: 320.00, dueDate: '2024-08-15', status: 'Pendente', type: 'payable' },

  // Contas a Receber
  { id: 'r1', customerId: 'cust-3', description: 'Encomenda Festa - Sra. Roberta', amount: 550.00, dueDate: '2024-08-08', status: 'Pendente', type: 'receivable' },
  { id: 'r2', description: 'Vale-Funcionário - Pedro Costa', amount: 80.00, dueDate: '2024-08-05', status: 'Pago', type: 'receivable' },
  { id: 'r3', customerId: 'cust-2', description: 'Evento Corporativo - Empresa XYZ', amount: 1800.00, dueDate: '2024-07-25', status: 'Atrasado', type: 'receivable' },
];

const initializeFinancials = () => {
    const financials = localStorage.getItem(FINANCIALS_KEY);
    if (!financials) {
        localStorage.setItem(FINANCIALS_KEY, JSON.stringify(MOCK_FINANCIALS_INITIAL));
    }
}

initializeFinancials();

const getFromStorage = (): AccountTransaction[] => {
    const data = localStorage.getItem(FINANCIALS_KEY);
    return data ? JSON.parse(data) : [];
}

const saveToStorage = (data: AccountTransaction[]) => {
    localStorage.setItem(FINANCIALS_KEY, JSON.stringify(data));
}

/**
 * Simulates fetching financial data from the backend.
 */
export const getFinancials = (): Promise<AccountTransaction[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(getFromStorage()), 450); // Simulate network delay
    });
};

export const addReceivable = (transactionData: Omit<AccountTransaction, 'id'>): Promise<AccountTransaction> => {
    return new Promise(resolve => {
        const financials = getFromStorage();
        const newTransaction: AccountTransaction = { ...transactionData, id: uuidv4() };
        saveToStorage([...financials, newTransaction]);
        resolve(newTransaction);
    });
};

export const settleCustomerDebts = (customerId: string): Promise<void> => {
    return new Promise(resolve => {
        let financials = getFromStorage();
        financials = financials.map(t => {
            if (t.type === 'receivable' && t.customerId === customerId && t.status !== 'Pago') {
                return { ...t, status: 'Pago' };
            }
            return t;
        });
        saveToStorage(financials);
        resolve();
    });
};

export const updateTransactionStatus = (transactionId: string, status: 'Pago'): Promise<AccountTransaction> => {
    return new Promise((resolve, reject) => {
        const financials = getFromStorage();
        const index = financials.findIndex(t => t.id === transactionId);
        if (index === -1) {
            return reject(new Error('Transaction not found'));
        }
        const updatedTransaction = { ...financials[index], status };
        financials[index] = updatedTransaction;
        saveToStorage(financials);
        resolve(updatedTransaction);
    });
};
