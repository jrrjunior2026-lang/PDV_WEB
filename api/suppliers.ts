import { v4 as uuidv4 } from 'uuid';
import type { Supplier } from '../types';

const SUPPLIERS_KEY = 'pdv-suppliers';

const MOCK_SUPPLIERS_INITIAL: Supplier[] = [
  { id: 'supp-1', name: 'Fornecedor de Café Grãos S.A.', contactPerson: 'Mariana Lima', email: 'contato@cafegraos.com', phone: '(35) 3456-7890', cnpj: '12.345.678/0001-99' },
  { id: 'supp-2', name: 'Distribuidora de Embalagens PackMais', contactPerson: 'Carlos Eduardo', email: 'vendas@packmais.com.br', phone: '(11) 5555-1234', cnpj: '98.765.432/0001-11' },
  { id: 'supp-3', name: 'Fazenda Leite Puro', contactPerson: 'Ricardo Nunes', email: 'ricardo.n@leitepuro.com', phone: '(19) 99887-6655', cnpj: '45.678.912/0001-33' },
];

const initializeSuppliers = () => {
  const suppliers = localStorage.getItem(SUPPLIERS_KEY);
  if (!suppliers) {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(MOCK_SUPPLIERS_INITIAL));
  }
};

initializeSuppliers();

const getSuppliersFromStorage = (): Supplier[] => {
  const suppliersJson = localStorage.getItem(SUPPLIERS_KEY);
  return suppliersJson ? JSON.parse(suppliersJson) : [];
};

const saveSuppliersToStorage = (suppliers: Supplier[]) => {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
};

export const getSuppliers = (): Promise<Supplier[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getSuppliersFromStorage()), 200);
  });
};

export const findSupplierByCnpj = (cnpj: string): Promise<Supplier | undefined> => {
    return new Promise((resolve) => {
        const suppliers = getSuppliersFromStorage();
        resolve(suppliers.find(s => s.cnpj === cnpj));
    });
};

export const addSupplier = (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const suppliers = getSuppliersFromStorage();
            const newSupplier: Supplier = { ...supplierData, id: uuidv4() };
            const updatedSuppliers = [...suppliers, newSupplier];
            saveSuppliersToStorage(updatedSuppliers);
            resolve(newSupplier);
        }, 200);
    });
};

export const updateSupplier = (updatedSupplier: Supplier): Promise<Supplier> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const suppliers = getSuppliersFromStorage();
            const index = suppliers.findIndex(s => s.id === updatedSupplier.id);
            if (index === -1) {
                return reject(new Error('Supplier not found'));
            }
            const updatedSuppliers = [...suppliers];
            updatedSuppliers[index] = updatedSupplier;
            saveSuppliersToStorage(updatedSuppliers);
            resolve(updatedSupplier);
        }, 200);
    });
};

export const deleteSupplier = (supplierId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const suppliers = getSuppliersFromStorage();
            const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
            saveSuppliersToStorage(updatedSuppliers);
            resolve();
        }, 200);
    });
};