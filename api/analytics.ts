
import type { SaleRecord, Customer, Product, AccountTransaction, PaymentMethod } from '../types';

// Date helpers
const getStartOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};


const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    if (today === yesterday) return 0;
    return ((today - yesterday) / yesterday) * 100;
};

export const getDashboardData = async (
    salesHistory: SaleRecord[], 
    customers: Customer[],
    products: Product[],
    financials: AccountTransaction[],
) => {
    const today = getStartOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // --- Daily Data for Trend KPIs ---
    const salesToday = salesHistory.filter(s => isSameDay(new Date(s.timestamp), today));
    const salesYesterday = salesHistory.filter(s => isSameDay(new Date(s.timestamp), yesterday));

    const totalSalesToday = salesToday.reduce((sum, s) => sum + s.total, 0);
    const totalSalesYesterday = salesYesterday.reduce((sum, s) => sum + s.total, 0);

    const ticketMedioToday = salesToday.length > 0 ? totalSalesToday / salesToday.length : 0;
    const ticketMedioYesterday = salesYesterday.length > 0 ? salesYesterday.reduce((sum, s) => sum + s.total, 0) / salesYesterday.length : 0;

    const newCustomersToday = customers.filter(c => isSameDay(new Date(c.createdAt), today)).length;
    const newCustomersYesterday = customers.filter(c => isSameDay(new Date(c.createdAt), yesterday)).length;

    const itemsSoldToday = salesToday.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const itemsSoldYesterday = salesYesterday.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // --- Non-trend KPIs ---
    const totalPayablePending = financials.filter(t => t.type === 'payable' && t.status !== 'Pago').reduce((sum, t) => sum + t.amount, 0);
    const totalReceivablePending = financials.filter(t => t.type === 'receivable' && t.status !== 'Pago').reduce((sum, t) => sum + t.amount, 0);
    
    // --- 7-Day Sales Trend Chart ---
    const salesTrend = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const salesOnDay = salesHistory.filter(s => isSameDay(new Date(s.timestamp), date));
        return {
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            total: salesOnDay.reduce((sum, s) => sum + s.total, 0),
        };
    }).reverse();

    // --- Payment Methods Donut Chart ---
    const paymentMethods = salesHistory.reduce((acc, sale) => {
        sale.payments.forEach(payment => {
            acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
        });
        return acc;
    }, {} as Record<PaymentMethod, number>);

    const paymentMethodsData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    // --- Top Lists (Unchanged) ---
    const productSales = salesHistory.reduce((acc, sale) => {
        sale.items.forEach(item => {
            if (!acc[item.id]) acc[item.id] = { name: item.name, total: 0 };
            acc[item.id].total += item.price * item.quantity;
        });
        return acc;
    }, {} as Record<string, { name: string; total: number }>);
    const topProducts = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5);
    const customerSales = salesHistory.reduce((acc, sale) => {
        if (sale.customerId && sale.customerName) {
            if (!acc[sale.customerId]) acc[sale.customerId] = { name: sale.customerName, total: 0 };
            acc[sale.customerId].total += sale.total;
        }
        return acc;
    }, {} as Record<string, { name: string; total: number }>);
    const topCustomers = Object.values(customerSales).sort((a, b) => b.total - a.total).slice(0, 5);

    return {
        kpis: {
            totalSalesToday: { value: totalSalesToday, trend: calculateTrend(totalSalesToday, totalSalesYesterday) },
            ticketMedio: { value: ticketMedioToday, trend: calculateTrend(ticketMedioToday, ticketMedioYesterday) },
            newCustomersToday: { value: newCustomersToday, trend: calculateTrend(newCustomersToday, newCustomersYesterday) },
            itemsSoldToday: { value: itemsSoldToday, trend: calculateTrend(itemsSoldToday, itemsSoldYesterday) },
            totalPayablePending,
            totalReceivablePending,
        },
        charts: {
            salesTrend,
            paymentMethods: paymentMethodsData,
        },
        lists: {
            topProducts,
            topCustomers
        }
    };
};
