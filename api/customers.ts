import { v4 as uuidv4 } from 'uuid';
import type { Customer } from '../types';

const CUSTOMERS_KEY = 'pdv-customers';

const MOCK_CUSTOMERS_INITIAL: Customer[] = [
  { id: 'cust-1', name: 'Cliente Padrão', email: 'consumidor@email.com', phone: '(99) 99999-9999', cpf: '000.000.000-00' },
  { id: 'cust-2', name: 'Ana Carolina', email: 'ana.c@example.com', phone: '(11) 98765-4321', cpf: '123.456.789-10' },
  { id: 'cust-3', name: 'Bruno Alves', email: 'bruno.a@work.net', phone: '(21) 91234-5678', cpf: '234.567.890-11' },
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

export const addCustomer = (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const customers = getCustomersFromStorage();
            const newCustomer: Customer = { ...customerData, id: uuidv4() };
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