import React, { useState } from 'react';

interface OpenShiftModalProps {
    onOpen: (openingBalance: number) => void;
}

const OpenShiftModal: React.FC<OpenShiftModalProps> = ({ onOpen }) => {
    const [balance, setBalance] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const openingBalance = parseFloat(balance);
        if (!isNaN(openingBalance) && openingBalance >= 0) {
            setIsLoading(true);
            // Simulate a slight delay
            setTimeout(() => {
                onOpen(openingBalance);
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-8 border border-brand-border w-full max-w-md flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Abrir Caixa</h2>
                <p className="text-brand-subtle mb-6 text-center">Informe o valor inicial de troco para começar o turno.</p>
                
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="my-6">
                        <label htmlFor="opening-balance" className="block text-sm font-medium text-brand-subtle mb-1 text-left">
                            Valor de Abertura (R$)
                        </label>
                         <input
                            id="opening-balance"
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            step="0.01"
                            min="0"
                            required
                            autoFocus
                            className="w-full text-center text-3xl font-bold bg-brand-primary border border-brand-border text-brand-accent rounded-md p-3 focus:ring-brand-accent focus:border-brand-accent"
                            placeholder="0,00"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || balance === ''}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? 'Abrindo...' : 'Confirmar e Abrir Caixa'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OpenShiftModal;