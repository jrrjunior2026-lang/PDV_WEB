
import React from 'react';
import KpiCard from './KpiCard';
import SalesTrendChart from './SalesTrendChart';
import PaymentMethodDonut from './PaymentMethodDonut';
import TopItemsList from './TopItemsList';
import GeminiAnalyzer from '../../GeminiAnalyzer';
import type { SaleRecord, Product } from '../../../types';


interface MainDashboardProps {
    data: any; // Analytics data
    salesHistory: SaleRecord[];
    products: Product[];
}

const CurrencyBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const MainDashboard: React.FC<MainDashboardProps> = ({ data, salesHistory, products }) => {
    if (!data) return null;

    const { kpis, charts, lists } = data;

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Dashboard de Performance</h2>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <KpiCard title="Vendas do Dia" value={CurrencyBRL.format(kpis.totalSalesToday.value)} trend={kpis.totalSalesToday.trend} />
                <KpiCard title="Ticket Médio" value={CurrencyBRL.format(kpis.ticketMedio.value)} trend={kpis.ticketMedio.trend} />
                <KpiCard title="Novos Clientes" value={kpis.newCustomersToday.value} trend={kpis.newCustomersToday.trend} />
                <KpiCard title="Itens Vendidos" value={kpis.itemsSoldToday.value} trend={kpis.itemsSoldToday.trend} />
                <KpiCard title="Total a Pagar (Pendente)" value={CurrencyBRL.format(kpis.totalPayablePending)} variant="danger" />
                <KpiCard title="Total a Receber (Pendente)" value={CurrencyBRL.format(kpis.totalReceivablePending)} variant="success" />
            </div>

            {/* AI Analyzer */}
            <GeminiAnalyzer salesHistory={salesHistory} products={products} />

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mt-8">
                <div className="xl:col-span-3 bg-brand-secondary rounded-lg border border-brand-border p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Tendência de Vendas (Últimos 7 dias)</h3>
                    {charts.salesTrend && charts.salesTrend.length > 1 ? (
                       <SalesTrendChart data={charts.salesTrend} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-brand-subtle">Dados insuficientes para exibir tendência.</div>
                    )}
                </div>
                <div className="xl:col-span-2 bg-brand-secondary rounded-lg border border-brand-border p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Faturamento por Pagamento</h3>
                    {charts.paymentMethods && charts.paymentMethods.length > 0 ? (
                        <PaymentMethodDonut data={charts.paymentMethods} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-brand-subtle">Nenhum pagamento registrado.</div>
                    )}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-brand-secondary rounded-lg border border-brand-border p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Top 5 Produtos (Geral)</h3>
                    <TopItemsList items={lists.topProducts} valueType="currency" />
                </div>
                <div className="bg-brand-secondary rounded-lg border border-brand-border p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Top 5 Clientes (Geral)</h3>
                    <TopItemsList items={lists.topCustomers} valueType="currency" />
                </div>
             </div>
        </div>
    );
};

export default MainDashboard;
