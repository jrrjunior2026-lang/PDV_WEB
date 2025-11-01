import type { User } from '../types';

const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Admin Geral', email: 'admin@pdv.com', role: 'Admin', status: 'Active' },
    { id: 'user-2', name: 'João Silva (Caixa 1)', email: 'caixa1@pdv.com', role: 'Caixa', status: 'Active' },
    { id: 'user-3', name: 'Maria Souza (Caixa 2)', email: 'caixa2@pdv.com', role: 'Caixa', status: 'Inactive' },
    { id: 'user-4', name: 'Gerente Loja', email: 'gerente@pdv.com', role: 'Admin', status: 'Active' },
];

/**
 * Simulates fetching the list of users from the backend.
 */
export const getUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_USERS), 200); // Simulate network delay
    });
};
