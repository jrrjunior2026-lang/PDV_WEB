import { v4 as uuidv4 } from 'uuid';
import type { Customer } from '../types';

const CUSTOMERS_KEY = 'pdv-customers';

const MOCK_CUSTOMERS_INITIAL: Customer[] = [
  { id: 'cust-1', name: 'Cliente Padrão', email: 'consumidor@email.com', phone: '(99) 99999-9999', cpf: '000.000.000-00', loyaltyPoints: 0, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), creditLimit: 0, currentBalance: 0 },
  { id: 'cust-2', name: 'Ana Carolina', email: 'ana.c@example.com', phone: '(11) 98765-4321', cpf: '123.456.789-10', loyaltyPoints: 150, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), creditLimit: 500, currentBalance: 0 },
  { id: 'cust-3', name: 'Bruno Alves', email: 'bruno.a@work.net', phone: '(21) 91234-5678', cpf: '234.567.890-11', loyaltyPoints: 85, createdAt: new Date().toISOString(), creditLimit: 250, currentBalance: 75.50 },
];

const initializeCustomers = () => {
  const customers = localStorage.getItem(CUSTOMERS_KEY);
  if (!customers) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(MOCK_CUSTOMERS_INITIAL));
  }
};

initializeCustomers();

const getCustomersFromStorage = (): Customer[] => {
  const customersJson = localStorage.getItem(CUSTOMERS_KEY);
  return customersJson ? JSON.parse(customersJson) : [];
};

const saveCustomersToStorage = (customers: Customer[]) => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const getCustomers = (): Promise<Customer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getCustomersFromStorage()), 150);
  });
};

export const addCustomer = (customerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'createdAt' | 'creditLimit' | 'currentBalance'>): Promise<Customer> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const customers = getCustomersFromStorage();
            const newCustomer: Customer = { 
                ...customerData, 
                id: uuidv4(), 
                loyaltyPoints: 0,
                createdAt: new Date().toISOString(),
                creditLimit: 0, // Default no credit
                currentBalance: 0,
            };
            const updatedCustomers = [...customers, newCustomer];
            saveCustomersToStorage(updatedCustomers);
            resolve(newCustomer);
        }, 200);
    });
};

export const updateCustomer = (updatedCustomer: Customer): Promise<Customer> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const customers = getCustomersFromStorage();
            const index = customers.findIndex(c => c.id === updatedCustomer.id);
            if (index === -1) {
                return reject(new Error('Customer not found'));
            }
            const updatedCustomers = [...customers];
            updatedCustomers[index] = updatedCustomer;
            saveCustomersToStorage(updatedCustomers);
            resolve(updatedCustomer);
        }, 200);
    });
};

export const updateCustomerPoints = (customerId: string, pointsChange: number): Promise<Customer> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const customers = getCustomersFromStorage();
            const index = customers.findIndex(c => c.id === customerId);
            if (index === -1) {
                return reject(new Error('Customer not found for points update'));
            }
            const updatedCustomer = { ...customers[index] };
            updatedCustomer.loyaltyPoints = (updatedCustomer.loyaltyPoints || 0) + pointsChange;
            customers[index] = updatedCustomer;
            saveCustomersToStorage(customers);
            resolve(updatedCustomer);
        }, 50);
    });
};

export const updateCustomerBalance = (customerId: string, amountChange: number, set?: boolean): Promise<Customer> => {
    return new Promise((resolve, reject) => {
        const customers = getCustomersFromStorage();
        const index = customers.findIndex(c => c.id === customerId);
        if (index === -1) {
            return reject(new Error('Customer not found for balance update'));
        }
        const updatedCustomer = { ...customers[index] };
        if (set) {
            updatedCustomer.currentBalance = amountChange;
        } else {
            updatedCustomer.currentBalance += amountChange;
        }
        customers[index] = updatedCustomer;
        saveCustomersToStorage(customers);
        resolve(updatedCustomer);
    });
};


export const deleteCustomer = (customerId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const customers = getCustomersFromStorage();
            const updatedCustomers = customers.filter(c => c.id !== customerId);
            saveCustomersToStorage(updatedCustomers);
            resolve();
        }, 200);
    });
};