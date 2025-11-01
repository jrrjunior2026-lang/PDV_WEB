
import React from 'react';
import type { CartItem } from '../types';

interface CartDisplayProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onPay: () => void;
}

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);


const CartDisplay: React.FC<CartDisplayProps> = ({ items, total, onUpdateQuantity, onClearCart, onPay }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-brand-border flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Venda Atual</h2>
        <button onClick={onClearCart} disabled={items.length === 0} className="text-brand-subtle hover:text-red-500 disabled:opacity-50 transition-colors">
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-brand-subtle pt-10">Carrinho vazio. Adicione produtos para iniciar a venda.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-brand-primary/50 p-2 rounded-md">
              <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-text">{item.name}</p>
                <p className="text-xs text-brand-subtle">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-12 bg-brand-primary border border-brand-border text-center rounded-md text-sm"
                />
              </div>
              <p className="w-20 text-right font-semibold text-brand-accent">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 mt-auto border-t border-brand-border bg-brand-secondary/50">
        <div className="flex justify-between items-center text-2xl font-bold mb-4">
          <span className="text-brand-text">Total:</span>
          <span className="text-brand-accent">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <button
          onClick={onPay}
          disabled={items.length === 0}
          className="w-full py-3 text-lg font-bold bg-green-600 text-white rounded-md hover:bg-green-500 disabled:bg-brand-subtle disabled:cursor-not-allowed transition-colors"
        >
          Finalizar e Emitir NFC-e
        </button>
      </div>
    </div>
  );
};

export default CartDisplay;
