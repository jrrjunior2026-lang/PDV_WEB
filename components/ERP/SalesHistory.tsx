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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Pagamento</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Descontos</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Itens</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {sortedSales.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-brand-subtle">
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
                  <div className="text-sm text-brand-subtle">{sale.customerName || 'Não identificado'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-subtle flex items-center gap-2">
                    {sale.payments.map(p => p.method).join(', ')}
                    {sale.loyaltyPointsRedeemed > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-900/50 text-yellow-300" title={`${sale.loyaltyPointsRedeemed} pontos resgatados`}>
                            Pontos
                        </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold text-right">
                  {sale.totalDiscount > 0 ? `-${sale.totalDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'R$ 0,00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text text-right">
                  {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-accent font-semibold text-right">
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