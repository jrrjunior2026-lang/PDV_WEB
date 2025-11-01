import React from 'react';

interface TopItemsListProps {
    items: { name: string; total: number, quantity?: number }[];
    valueType: 'currency' | 'quantity';
}

const TopItemsList: React.FC<TopItemsListProps> = ({ items, valueType }) => {
    if (items.length === 0) {
        return <div className="text-center text-brand-subtle py-8">Nenhum dado disponível.</div>
    }

    const maxValue = Math.max(...items.map(item => item.total));

    return (
        <ul className="space-y-4">
            {items.map((item, index) => {
                const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
                const displayValue = valueType === 'currency' 
                    ? item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : `${item.quantity} un`;

                return (
                    <li key={index}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold text-brand-text truncate pr-2">{item.name}</span>
                            <span className="text-brand-subtle font-mono">{displayValue}</span>
                        </div>
                        <div className="w-full bg-brand-primary/50 rounded-full h-2">
                            <div
                                className="bg-brand-accent h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default TopItemsList;
