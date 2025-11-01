import { v4 as uuidv4 } from 'uuid';
import type { Product } from '../types';

const PRODUCTS_KEY = 'pdv-products';

// FIX: Renamed from MOCK_PRODUCTS_INITIAL and exported to be used in other modules.
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'PROD001', name: 'Café Espresso', price: 5.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1511920183276-594337af969b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '21011110', cfop: '5102' } },
  { id: '2', code: 'PROD002', name: 'Pão de Queijo', price: 3.50, category: 'Salgados', imageUrl: 'https://images.unsplash.com/photo-1593010877301-4321a084249a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '19059090', cfop: '5102' } },
  { id: '3', code: 'PROD003', name: 'Croissant', price: 6.00, category: 'Salgados', imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '19059090', cfop: '5102' } },
  { id: '4', code: 'PROD004', name: 'Suco de Laranja', price: 7.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '20091200', cfop: '5102' } },
  { id: '5', code: 'PROD005', name: 'Bolo de Chocolate', price: 8.50, category: 'Doces', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '19053100', cfop: '5102' } },
  { id: '6', code: 'PROD006', name: 'Água Mineral', price: 3.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1543274266-97696c021163?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '22011000', cfop: '5102' } },
  { id: '7', code: 'PROD007', name: 'Coxinha', price: 7.50, category: 'Salgados', imageUrl: 'https://images.unsplash.com/photo-1622373059272-9a3e236fabc6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '16023220', cfop: '5102' } },
  { id: '8', code: 'PROD008', name: 'Brigadeiro', price: 2.50, category: 'Doces', imageUrl: 'https://images.unsplash.com/photo-1604193355122-35a5a78c1f3a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400', fiscalData: { ncm: '17049020', cfop: '5102' } },
];

const initializeProducts = () => {
  const products = localStorage.getItem(PRODUCTS_KEY);
  if (!products) {
    // FIX: Use the renamed MOCK_PRODUCTS variable.
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
  }
};

initializeProducts();

const getProductsFromStorage = (): Product[] => {
  const productsJson = localStorage.getItem(PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getProductsFromStorage()), 300);
  });
};

export const findProductByCode = (code: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
        const products = getProductsFromStorage();
        resolve(products.find(p => p.code === code));
    });
};

export const addProduct = (productData: Omit<Product, 'id'>): Promise<Product> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const products = getProductsFromStorage();
            const newProduct: Product = { ...productData, id: uuidv4() };
            const updatedProducts = [...products, newProduct];
            saveProductsToStorage(updatedProducts);
            resolve(newProduct);
        }, 200);
    });
};

export const updateProduct = (updatedProduct: Product): Promise<Product> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const products = getProductsFromStorage();
            const index = products.findIndex(p => p.id === updatedProduct.id);
            if (index === -1) {
                return reject(new Error('Product not found'));
            }
            const updatedProducts = [...products];
            updatedProducts[index] = updatedProduct;
            saveProductsToStorage(updatedProducts);
            resolve(updatedProduct);
        }, 200);
    });
};

export const deleteProduct = (productId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const products = getProductsFromStorage();
            const updatedProducts = products.filter(p => p.id !== productId);
            saveProductsToStorage(updatedProducts);
            resolve();
        }, 200);
    });
};