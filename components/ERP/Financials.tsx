
import React from 'react';
import type { AccountTransaction } from '../../types';

interface FinancialsProps {
  transactions: AccountTransaction[];
  onUpdateStatus: (transactionId: string) => void;
}

const FinancialsTable: React.FC<{ title: string; data: AccountTransaction[], onUpdateStatus: (transactionId: string) => void; }> = ({ title, data, onUpdateStatus }) => {
    
    const getStatusColor = (status: 'Pendente' | 'Pago' | 'Atrasado') => {
        switch (status) {
            case 'Pago': return 'text-green-400';
            case 'Atrasado': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    }

    return (
        <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
            <h3 className="text-xl font-bold text-white p-4 bg-brand-border/30">{title}</h3>
            <table className="min-w-full divide-y divide-brand-border">
                <thead className="bg-brand-border/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Descrição</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Vencimento</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Valor</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-brand-border/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{new Date(item.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                <span className={getStatusColor(item.status)}>{item.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-brand-accent">
                                {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                {(item.status === 'Pendente' || item.status === 'Atrasado') && (
                                    <button
                                        onClick={() => onUpdateStatus(item.id)}
                                        className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600/20 text-green-300 hover:bg-green-600/40"
                                    >
                                        Marcar como Pago
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const Financials: React.FC<FinancialsProps> = ({ transactions, onUpdateStatus }) => {
  const payable = transactions.filter(t => t.type === 'payable');
  const receivable = transactions.filter(t => t.type === 'receivable');

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Módulo Financeiro</h2>
      <div className="space-y-8">
        <FinancialsTable title="Contas a Pagar" data={payable} onUpdateStatus={onUpdateStatus} />
        <FinancialsTable title="Contas a Receber" data={receivable} onUpdateStatus={onUpdateStatus} />
      </div>
    </div>
  );
};

export default Financials;
