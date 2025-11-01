import { v4 as uuidv4 } from 'uuid';
import type { User } from '../types';

const USERS_KEY = 'pdv-users';

const MOCK_USERS_INITIAL: User[] = [
    { id: 'user-1', name: 'Admin Geral', email: 'admin@pdv.com', role: 'Admin', status: 'Active' },
    { id: 'user-2', name: 'João Silva (Caixa 1)', email: 'caixa1@pdv.com', role: 'Caixa', status: 'Active' },
    { id: 'user-3', name: 'Maria Souza (Caixa 2)', email: 'caixa2@pdv.com', role: 'Caixa', status: 'Inactive' },
    { id: 'user-4', name: 'Gerente Loja', email: 'gerente@pdv.com', role: 'Admin', status: 'Active' },
];

const initializeUsers = () => {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS_INITIAL));
    }
};

initializeUsers();

const getUsersFromStorage = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsersToStorage = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};


/**
 * Simulates fetching the list of users from the backend.
 */
export const getUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(getUsersFromStorage()), 200); // Simulate network delay
    });
};

export const addUser = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            const newUser: User = { ...userData, id: uuidv4() };
            const updatedUsers = [...users, newUser];
            saveUsersToStorage(updatedUsers);
            resolve(newUser);
        }, 200);
    });
};

export const updateUser = (updatedUser: User): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            const index = users.findIndex(u => u.id === updatedUser.id);
            if (index === -1) {
                return reject(new Error('User not found'));
            }
            const updatedUsers = [...users];
            updatedUsers[index] = updatedUser;
            saveUsersToStorage(updatedUsers);
            resolve(updatedUser);
        }, 200);
    });
};

export const deleteUser = (userId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            const updatedUsers = users.filter(u => u.id !== userId);
            saveUsersToStorage(updatedUsers);
            resolve();
        }, 200);
    });
};