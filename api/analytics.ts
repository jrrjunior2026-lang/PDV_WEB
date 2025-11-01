import type { SaleRecord, Customer, Product } from '../types';

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export const getDashboardData = async (
    salesHistory: SaleRecord[], 
    customers: Customer[],
    products: Product[],
) => {
    // --- KPIs ---
    const salesToday = salesHistory.filter(s => isToday(new Date(s.timestamp)));
    const totalSalesToday = salesToday.reduce((sum, s) => sum + s.total, 0);
    const ticketMedio = salesToday.length > 0 ? totalSalesToday / salesToday.length : 0;
    const newCustomersToday = customers.filter(c => isToday(new Date(c.createdAt))).length;
    const itemsSoldToday = salesToday.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // --- Charts & Lists ---
    const salesByHour = Array(24).fill(0).map((_, hour) => {
        const salesInHour = salesToday.filter(s => new Date(s.timestamp).getHours() === hour);
        return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            total: salesInHour.reduce((sum, s) => sum + s.total, 0),
        };
    }).filter(h => h.total > 0);

    const productSales = salesHistory.reduce((acc, sale) => {
        sale.items.forEach(item => {
            if (!acc[item.id]) {
                acc[item.id] = { name: item.name, quantity: 0, total: 0 };
            }
            acc[item.id].quantity += item.quantity;
            acc[item.id].total += item.price * item.quantity;
        });
        return acc;
    }, {} as Record<string, { name: string; quantity: number; total: number }>);
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    const customerSales = salesHistory.reduce((acc, sale) => {
        if (sale.customerId) {
            if (!acc[sale.customerId]) {
                acc[sale.customerId] = { name: sale.customerName || 'N/A', total: 0 };
            }
            acc[sale.customerId].total += sale.total;
        }
        return acc;
    }, {} as Record<string, { name: string; total: number }>);

    const topCustomers = Object.values(customerSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return {
        kpis: {
            totalSalesToday,
            ticketMedio,
            newCustomersToday,
            itemsSoldToday
        },
        charts: {
            salesByHour
        },
        lists: {
            topProducts,
            topCustomers
        }
    };
};
