import React, { useState, useMemo } from 'react';
import type { Customer } from '../types';

interface CustomerSearchModalProps {
    customers: Customer[];
    onClose: () => void;
    onSelect: (customer: Customer) => void;
}

const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({ customers, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) {
            return customers.filter(c => c.id !== 'cust-1'); // Exclude default customer
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.id !== 'cust-1' &&
            (c.name.toLowerCase().includes(lowerCaseSearch) || c.cpf.includes(lowerCaseSearch))
        );
    }, [customers, searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-lg flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Selecionar Cliente</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>
                
                <div className="mb-4 relative flex-shrink-0">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome ou CPF..."
                        autoFocus
                        className="w-full bg-brand-primary border border-brand-border rounded-md p-2 pl-4 text-brand-text placeholder-brand-subtle focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                    />
                </div>

                <div className="overflow-y-auto pr-2 flex-grow space-y-2">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => onSelect(customer)}
                                className="p-3 bg-brand-primary/50 hover:bg-brand-accent/20 rounded-md cursor-pointer transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold text-brand-text">{customer.name}</p>
                                    <p className="text-sm text-brand-subtle">{customer.cpf}</p>
                                </div>
                                {customer.loyaltyPoints > 0 && (
                                    <div className="text-right">
                                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-900/50 text-yellow-300">
                                            {customer.loyaltyPoints} pts
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-brand-subtle pt-8">Nenhum cliente encontrado.</p>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border text-right flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerSearchModal;