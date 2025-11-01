import type { UserRole, Permission } from '../types';

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
    // Admins and Managers have all permissions in this setup
    if (role === 'Admin' || role === 'Gerente') return true;
    return permissions[role].includes(permission);
};
