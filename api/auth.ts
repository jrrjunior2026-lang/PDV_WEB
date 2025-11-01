import type { User, UserRole, Permission } from '../types';
import * as userApi from './users';

const permissions: Record<UserRole, Permission[]> = {
    Admin: [
        'view_dashboard',
        'manage_products',
        'manage_customers',
        'manage_suppliers',
        'view_reports',
        'manage_inventory',
        'manage_financials',
        'manage_users',
        'manage_purchasing',
    ],
    Gerente: [
        'view_dashboard',
        'manage_products',
        'manage_customers',
        'manage_suppliers',
        'view_reports',
        'manage_inventory',
        'manage_financials',
        'manage_users',
        'manage_purchasing',
    ],
    Caixa: [], // Caixa only has access to PDV, not any specific ERP modules
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
    return permissions[role].includes(permission);
};

export const login = async (email: string): Promise<{ user: User; token: string } | null> => {
    const users = await userApi.getUsers();
    // In a real app, you'd check a password hash against the one sent from the backend
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'Active');
    if (user) {
        console.log(`[AUTH_LOG] Login successful for user: ${user.name} (${user.role})`);
        // In a real app, this token would come from the backend server
        const fakeJwtPayload = { sub: user.id, name: user.name, role: user.role, iat: Math.floor(Date.now() / 1000) };
        const fakeJwt = `fake-header.${btoa(JSON.stringify(fakeJwtPayload))}.fake-signature`;
        
        return { user, token: fakeJwt };
    }
    console.log(`[AUTH_LOG] Login failed for email: ${email}`);
    return null;
};


export const findUserById = async (userId: string): Promise<User | null> => {
    const users = await userApi.getUsers();
    const user = users.find(u => u.id === userId);
    console.log(`[AUTH_LOG] Finding user by ID: ${user?.name} (${user?.role})`);
    return user || null;
};