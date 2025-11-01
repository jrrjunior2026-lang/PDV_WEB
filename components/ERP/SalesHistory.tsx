import React from 'react';
import type { SaleRecord } from '../../types';

interface SalesHistoryProps {
  sales: SaleRecord[];
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales }) => {
  const sortedSales = [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Relatório de Vendas (Histórico)</h2>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Data / Hora</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Pagamento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Itens</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {sortedSales.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-brand-subtle">
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
            )}
            {sortedSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{new Date(sale.timestamp).toLocaleString('pt-BR')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-subtle">{sale.payments.map(p => p.method).join(', ')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                  {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-accent font-semibold">
                  {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesHistory;