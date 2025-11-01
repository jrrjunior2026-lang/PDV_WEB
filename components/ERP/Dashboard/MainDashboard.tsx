import React from 'react';
import KpiCard from './KpiCard';
import SalesByHourChart from './SalesByHourChart';
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Vendas do Dia" value={CurrencyBRL.format(kpis.totalSalesToday)} />
                <KpiCard title="Ticket Médio" value={CurrencyBRL.format(kpis.ticketMedio)} />
                <KpiCard title="Novos Clientes (Hoje)" value={kpis.newCustomersToday} />
                <KpiCard title="Itens Vendidos (Hoje)" value={kpis.itemsSoldToday} />
            </div>

            {/* AI Analyzer */}
            <GeminiAnalyzer salesHistory={salesHistory} products={products} />

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-brand-secondary rounded-lg border border-brand-border p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Vendas por Hora (Hoje)</h3>
                    {charts.salesByHour.length > 0 ? (
                       <SalesByHourChart data={charts.salesByHour} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-brand-subtle">Nenhuma venda hoje para exibir.</div>
                    )}
                </div>
                <div className="bg-brand-secondary rounded-lg border border-brand-border p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Top 5 Produtos (Geral)</h3>
                    <TopItemsList items={lists.topProducts} valueType="currency" />
                </div>
            </div>
             <div className="mt-8 bg-brand-secondary rounded-lg border border-brand-border p-6">
                 <h3 className="text-xl font-bold text-white mb-4">Top 5 Clientes (Geral)</h3>
                 <TopItemsList items={lists.topCustomers} valueType="currency" />
            </div>
        </div>
    );
};

export default MainDashboard;