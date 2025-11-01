import React, { useState } from 'react';
import type { Product, InventoryCountItem, InventoryReport } from '../../types';
import * as inventoryApi from '../../api/inventory';

interface InventoryCountModalProps {
    products: Product[];
    onClose: () => void;
    onSubmit: (report: InventoryReport) => void;
}

const InventoryCountModal: React.FC<InventoryCountModalProps> = ({ products, onClose, onSubmit }) => {
    const [counts, setCounts] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCountChange = (productId: string, value: string) => {
        setCounts(prev => ({ ...prev, [productId]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // FIX: Refactored to use Object.keys to avoid potential type inference issues with Object.entries.
        const countItems: InventoryCountItem[] = Object.keys(counts)
            .map((productId) => ({
                productId,
                countedQuantity: parseInt(counts[productId], 10) || 0,
            }));
        
        // Ensure all products are included, even if not touched
        products.forEach(p => {
            if (!countItems.find(ci => ci.productId === p.id)) {
                countItems.push({ productId: p.id, countedQuantity: 0 });
            }
        });

        const report = await inventoryApi.processInventoryCount(countItems);
        setIsSubmitting(false);
        onSubmit(report);
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Contagem de Inventário Físico</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>

                <div className="overflow-y-auto pr-2 flex-grow">
                    <p className="text-sm text-brand-subtle mb-4">Insira a quantidade física contada para cada produto. Itens não preenchidos serão considerados como 0.</p>
                    <table className="min-w-full divide-y divide-brand-border">
                        <thead className="bg-brand-border/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Produto</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider w-32">Quantidade Contada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-4 py-3 text-sm text-white font-medium">{product.name}</td>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="number"
                                            value={counts[product.id] || ''}
                                            onChange={e => handleCountChange(product.id, e.target.value)}
                                            className="w-full bg-brand-primary border border-brand-border text-center rounded-md text-sm p-2"
                                            placeholder="0"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border text-right flex-shrink-0">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
                    >
                        {isSubmitting ? 'Processando...' : 'Finalizar e Gerar Relatório'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryCountModal;