import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import PrintableLabels from './PrintableLabels';

interface LabelPrintModalProps {
    product: Product;
    onClose: () => void;
}

const LabelPrintModal: React.FC<LabelPrintModalProps> = ({ product, onClose }) => {
    const [quantity, setQuantity] = useState('3');
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        if (parseInt(quantity, 10) > 0) {
            setIsPrinting(true);
        }
    };

    useEffect(() => {
        if (isPrinting) {
            const handleAfterPrint = () => {
                setIsPrinting(false);
                onClose();
                window.removeEventListener('afterprint', handleAfterPrint);
            };
            window.addEventListener('afterprint', handleAfterPrint);
            
            // Allow component to render before printing
            setTimeout(() => {
                window.print();
            }, 100);
        }
    }, [isPrinting, onClose]);

    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Imprimir Etiquetas</h2>
                        <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                    </div>
                    <div className="my-4">
                        <p className="text-brand-subtle mb-1">Produto:</p>
                        <p className="text-lg font-semibold text-brand-text">{product.name}</p>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-brand-subtle mb-1">
                            Quantidade de Etiquetas
                        </label>
                        <input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            max="99"
                            required
                            autoFocus
                            className="w-full text-center text-2xl font-bold bg-brand-primary border border-brand-border text-brand-accent rounded-md p-2"
                        />
                    </div>
                    <div className="mt-6 pt-4 border-t border-brand-border flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={!quantity || parseInt(quantity, 10) <= 0}
                            className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 disabled:opacity-50"
                        >
                            Gerar e Imprimir
                        </button>
                    </div>
                </div>
            </div>
            {isPrinting && <PrintableLabels product={product} quantity={parseInt(quantity, 10)} />}
        </>
    );
};

export default LabelPrintModal;