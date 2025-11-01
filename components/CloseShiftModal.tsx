import React, { useState, useMemo } from 'react';
import type { CashShift } from '../../types';

interface CloseShiftModalProps {
    shift: CashShift;
    onClose: () => void;
    onSubmit: (closingBalance: number) => void;
}

const InfoRow: React.FC<{ label: string; value: string | number; className?: string; isCurrency?: boolean }> = ({ label, value, className, isCurrency = true }) => {
    const formattedValue = typeof value === 'number' && isCurrency
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : value;
    
    return (
        <div className={`flex justify-between items-center py-2 border-b border-brand-border/50 ${className}`}>
            <span className="text-sm text-brand-subtle">{label}</span>
            <span className="text-sm font-semibold text-brand-text">{formattedValue}</span>
        </div>
    );
};

const CloseShiftModal: React.FC<CloseShiftModalProps> = ({ shift, onClose, onSubmit }) => {
    const [counted, setCounted] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const summary = useMemo(() => {
        const suprimentos = shift.totalSuprimentos - shift.openingBalance;
        const totalSalesCash = shift.paymentTotals.Dinheiro || 0;
        const totalSalesElectronic = (shift.paymentTotals.PIX || 0) + (shift.paymentTotals.Credito || 0) + (shift.paymentTotals.Debito || 0);
        
        const expectedCash = shift.openingBalance + totalSalesCash + suprimentos - shift.totalSangrias;
        
        const countedValue = parseFloat(counted) || 0;
        const difference = countedValue - expectedCash;

        return { suprimentos, expectedCash, totalSalesCash, totalSalesElectronic, difference };
    }, [shift, counted]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const closingBalance = parseFloat(counted);
        if (!isNaN(closingBalance) && closingBalance >= 0) {
            setIsLoading(true);
            setTimeout(() => {
                onSubmit(closingBalance);
                setIsLoading(false);
            }, 500);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Fechar Turno de Caixa</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>

                <div className="space-y-3 mb-6">
                    <h3 className="text-lg font-semibold text-brand-accent border-b border-brand-border pb-2">Resumo do Turno</h3>
                    <InfoRow label="Abertura de Caixa (Suprimento Inicial)" value={shift.openingBalance} />
                    <InfoRow label="(+) Vendas em Dinheiro" value={summary.totalSalesCash} />
                    <InfoRow label="(+) Suprimentos Adicionais" value={summary.suprimentos} />
                    <InfoRow label="(-) Sangrias (Retiradas)" value={shift.totalSangrias} />
                    <InfoRow label="(=) Saldo Esperado em Caixa" value={summary.expectedCash} className="!text-lg font-bold !text-brand-accent bg-brand-primary/30 px-2 rounded" />
                    <div className="pt-2 border-t border-brand-border/50">
                        <InfoRow label="Total Vendas (Eletrônico)" value={summary.totalSalesElectronic} />
                        <InfoRow label="Total Geral de Vendas" value={shift.totalSales} className="font-bold"/>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="my-4">
                        <label htmlFor="counted-balance" className="block text-sm font-medium text-brand-subtle mb-1 text-left">
                            Valor Contado em Dinheiro (R$)
                        </label>
                         <input
                            id="counted-balance"
                            type="number"
                            value={counted}
                            onChange={(e) => setCounted(e.target.value)}
                            step="0.01"
                            min="0"
                            required
                            autoFocus
                            className="w-full text-center text-3xl font-bold bg-brand-primary border border-brand-border text-brand-accent rounded-md p-3 focus:ring-brand-accent focus:border-brand-accent"
                            placeholder="0,00"
                        />
                    </div>

                    <div className={`mt-4 p-3 rounded-md text-center ${summary.difference === 0 ? 'bg-brand-primary' : summary.difference > 0 ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                        <span className="text-sm text-brand-subtle">{summary.difference > 0 ? 'Sobra de Caixa' : summary.difference < 0 ? 'Quebra de Caixa' : 'Diferença'}</span>
                        <p className={`text-xl font-bold ${summary.difference === 0 ? 'text-brand-text' : summary.difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {summary.difference.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading || counted === ''}
                            className="bg-red-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        >
                            {isLoading ? 'Fechando...' : 'Confirmar e Fechar Turno'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CloseShiftModal;