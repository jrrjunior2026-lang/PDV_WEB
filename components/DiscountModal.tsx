import React, { useState } from 'react';

type DiscountTarget = { type: 'total' } | { type: 'item'; itemId: string };

interface DiscountModalProps {
    target: DiscountTarget;
    onClose: () => void;
    onSubmit: (amount: number, type: 'fixed' | 'percentage') => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ target, onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
            setIsLoading(true);
            setTimeout(() => {
                onSubmit(numericAmount, type);
                setIsLoading(false);
            }, 300);
        }
    };

    const title = target.type === 'item' ? 'Aplicar Desconto no Item' : 'Aplicar Desconto no Total';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label htmlFor="discount-amount" className="block text-sm font-medium text-brand-subtle mb-1">
                            Valor do Desconto
                        </label>
                        <div className="flex">
                            <input
                                id="discount-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                step="0.01"
                                min="0.01"
                                required
                                autoFocus
                                className="w-full text-lg font-bold bg-brand-primary border border-brand-border text-brand-accent rounded-l-md p-2 focus:ring-brand-accent focus:border-brand-accent"
                                placeholder="0,00"
                            />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                                className="bg-brand-border border border-brand-border text-brand-text p-2 rounded-r-md"
                            >
                                <option value="percentage">%</option>
                                <option value="fixed">R$</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-border flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading || amount === ''}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        >
                            {isLoading ? 'Aplicando...' : 'Aplicar Desconto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DiscountModal;