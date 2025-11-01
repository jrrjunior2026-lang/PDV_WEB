import React from 'react';
import type { CashShift } from '../../types';

interface ShiftHistoryProps {
  shifts: CashShift[];
}

const ShiftHistory: React.FC<ShiftHistoryProps> = ({ shifts }) => {
  const sortedShifts = [...shifts].sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
  
  const formatCurrency = (value: number | null | undefined) => {
      if (value === null || typeof value === 'undefined') return 'N/A';
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const getDifferenceClass = (diff: number | null | undefined) => {
      if (diff === null || typeof diff === 'undefined' || diff === 0) return 'text-brand-text';
      return diff > 0 ? 'text-green-400' : 'text-red-400';
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Histórico de Turnos de Caixa</h2>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Abertura</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Fechamento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Operador</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Total Vendas</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Valor Esperado</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Valor Fechado</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Diferença</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {sortedShifts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-brand-subtle">
                  Nenhum turno fechado encontrado.
                </td>
              </tr>
            )}
            {sortedShifts.map((shift) => (
              <tr key={shift.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{new Date(shift.openedAt).toLocaleString('pt-BR')}</div>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-subtle">{shift.closedAt ? new Date(shift.closedAt).toLocaleString('pt-BR') : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{shift.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-accent font-semibold text-right">{formatCurrency(shift.totalSales)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold text-right">{formatCurrency(shift.expectedBalance)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold text-right">{formatCurrency(shift.closingBalance)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${getDifferenceClass(shift.balanceDifference)}`}>
                    {formatCurrency(shift.balanceDifference)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftHistory;