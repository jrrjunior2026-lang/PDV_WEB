import type { AccountTransaction } from '../types';

const MOCK_FINANCIALS: AccountTransaction[] = [
  // Contas a Pagar
  { id: 'p1', description: 'Fornecedor de Café Grãos S.A.', amount: 1250.75, dueDate: '2024-08-10', status: 'Pendente', type: 'payable' },
  { id: 'p2', description: 'Aluguel do Ponto Comercial', amount: 3500.00, dueDate: '2024-08-05', status: 'Pago', type: 'payable' },
  { id: 'p3', description: 'Conta de Energia Elétrica', amount: 430.50, dueDate: '2024-07-20', status: 'Atrasado', type: 'payable' },
  { id: 'p4', description: 'Distribuidora de Embalagens', amount: 320.00, dueDate: '2024-08-15', status: 'Pendente', type: 'payable' },

  // Contas a Receber
  { id: 'r1', description: 'Encomenda Festa - Sra. Roberta', amount: 550.00, dueDate: '2024-08-08', status: 'Pendente', type: 'receivable' },
  { id: 'r2', description: 'Vale-Funcionário - Pedro Costa', amount: 80.00, dueDate: '2024-08-05', status: 'Pago', type: 'receivable' },
  { id: 'r3', description: 'Evento Corporativo - Empresa XYZ', amount: 1800.00, dueDate: '2024-07-25', status: 'Atrasado', type: 'receivable' },
];

/**
 * Simulates fetching financial data from the backend.
 */
export const getFinancials = (): Promise<AccountTransaction[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_FINANCIALS), 450); // Simulate network delay
    });
};
