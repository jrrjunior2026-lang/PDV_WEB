import React, { useState } from 'react';

interface ShiftMovementModalProps {
    type: 'Suprimento' | 'Sangria';
    onClose: () => void;
    onSubmit: (amount: number, reason: string) => void;
}

const ShiftMovementModal: React.FC<ShiftMovementModalProps> = ({ type, onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0 && reason.trim() !== '') {
            setIsLoading(true);
            setTimeout(() => {
                onSubmit(numericAmount, reason);
                setIsLoading(false);
            }, 500);
        }
    };

    const isSuprimento = type === 'Suprimento';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Registrar {type}</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label htmlFor="movement-amount" className="block text-sm font-medium text-brand-subtle mb-1">
                            Valor (R$)
                        </label>
                         <input
                            id="movement-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0.01"
                            required
                            autoFocus
                            className={`w-full text-center text-2xl font-bold bg-brand-primary border border-brand-border rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent ${isSuprimento ? 'text-green-400' : 'text-yellow-400'}`}
                            placeholder="0,00"
                        />
                    </div>
                     <div>
                        <label htmlFor="movement-reason" className="block text-sm font-medium text-brand-subtle mb-1">
                            Motivo / Descrição
                        </label>
                         <input
                            id="movement-reason"
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            maxLength={100}
                            className="w-full bg-brand-primary border border-brand-border text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent"
                            placeholder={isSuprimento ? 'Ex: Reforço de troco' : 'Ex: Retirada para o cofre'}
                        />
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-border flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading || amount === '' || reason.trim() === ''}
                            className={`${isSuprimento ? 'bg-blue-600 hover:bg-blue-500' : 'bg-yellow-600 hover:bg-yellow-500'} text-white font-semibold px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-wait transition-colors`}
                        >
                            {isLoading ? 'Registrando...' : `Confirmar ${type}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftMovementModal;